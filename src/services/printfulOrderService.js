import supabase from '../config/supabaseClient';
import { createOrder as createPrintfulOrder, confirmOrder } from './printfulService';

/**
 * Process order fulfillment through Printful
 * This should be called when a customer places an order for a Printful product
 *
 * @param {string} orderId - Local order ID
 * @param {Object} orderData - Order details
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const fulfillOrderWithPrintful = async (orderId, orderData) => {
  try {
    // Get the order details from local database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(*), customers(*), order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError) {
      return { data: null, error: orderError };
    }

    // Check if order contains Printful products
    const hasPrintfulProducts = order.products?.is_printful_product || false;

    if (!hasPrintfulProducts) {
      return {
        data: null,
        error: { message: 'Order does not contain Printful products' }
      };
    }

    // Prepare Printful order payload
    const printfulOrderPayload = {
      recipient: {
        name: orderData.customerName || order.customers?.name,
        address1: orderData.shippingAddress || order.shipping_address,
        city: orderData.city || order.customers?.city,
        state_code: orderData.state,
        country_code: orderData.country || order.customers?.country || 'US',
        zip: orderData.postalCode || order.customers?.postal_code,
        phone: orderData.phone || order.customers?.phone,
        email: orderData.email || order.customers?.email
      },
      items: [],
      retail_costs: {
        currency: 'USD',
        subtotal: parseFloat(order.total_amount),
        discount: 0,
        shipping: orderData.shippingCost || 0,
        tax: orderData.tax || 0
      },
      external_id: orderId // Reference to our local order
    };

    // Add items from order
    if (order.order_items && order.order_items.length > 0) {
      // Multiple items in order
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();

        if (product?.is_printful_product && product.printful_metadata) {
          // Get variant info from product metadata
          const variantId = product.printful_metadata.variants?.[0]?.id;

          if (variantId) {
            printfulOrderPayload.items.push({
              sync_variant_id: variantId,
              quantity: item.quantity,
              retail_price: parseFloat(item.unit_price).toFixed(2)
            });
          }
        }
      }
    } else {
      // Single product order
      const variantId = order.products?.printful_metadata?.variants?.[0]?.id;

      if (variantId) {
        printfulOrderPayload.items.push({
          sync_variant_id: variantId,
          quantity: order.quantity || 1,
          retail_price: parseFloat(order.total_amount).toFixed(2)
        });
      }
    }

    if (printfulOrderPayload.items.length === 0) {
      return {
        data: null,
        error: { message: 'No valid Printful items found in order' }
      };
    }

    // Create order estimate first
    const { data: estimate, error: estimateError } = await createPrintfulOrder(
      printfulOrderPayload,
      false // Don't confirm yet, just estimate
    );

    if (estimateError) {
      return { data: null, error: estimateError };
    }

    // Create confirmed order in Printful
    const { data: printfulOrder, error: printfulError } = await createPrintfulOrder(
      printfulOrderPayload,
      true // Confirm the order
    );

    if (printfulError) {
      return { data: null, error: printfulError };
    }

    // Save Printful order details to our database
    const { data: { user } } = await supabase.auth.getUser();

    const { data: savedOrder, error: saveError } = await supabase
      .from('printful_orders')
      .insert({
        user_id: user.id,
        order_id: orderId,
        printful_order_id: printfulOrder.external_id || orderId,
        printful_internal_id: printfulOrder.id,
        status: printfulOrder.status,
        costs: printfulOrder.costs,
        retail_costs: printfulOrder.retail_costs,
        items: printfulOrder.items,
        recipient: printfulOrder.recipient
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving Printful order to database:', saveError);
      // Don't return error here as the Printful order was created successfully
    }

    // Update local order status
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return {
      data: {
        printfulOrder,
        estimate,
        savedOrder
      },
      error: null
    };
  } catch (error) {
    console.error('Error fulfilling order with Printful:', error);
    return {
      data: null,
      error: { message: error.message || 'Failed to fulfill order with Printful' }
    };
  }
};

/**
 * Update local order status based on Printful webhook event
 *
 * @param {Object} webhookPayload - Webhook payload from Printful
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const handlePrintfulWebhook = async (webhookPayload) => {
  try {
    const { type, data: eventData } = webhookPayload;

    // Find the local order by Printful order ID
    const { data: printfulOrder, error: findError } = await supabase
      .from('printful_orders')
      .select('*, orders(*)')
      .eq('printful_order_id', eventData.order.external_id)
      .single();

    if (findError || !printfulOrder) {
      return {
        data: null,
        error: { message: 'Order not found' }
      };
    }

    let newStatus = printfulOrder.orders.status;

    // Update status based on webhook type
    switch (type) {
      case 'package_shipped':
        newStatus = 'completed';
        // Update with tracking info
        await supabase
          .from('printful_orders')
          .update({
            status: 'fulfilled',
            tracking_number: eventData.shipment?.tracking_number,
            tracking_url: eventData.shipment?.tracking_url,
            carrier: eventData.shipment?.carrier,
            service: eventData.shipment?.service,
            shipped_at: new Date().toISOString(),
            shipments: eventData.shipment
          })
          .eq('id', printfulOrder.id);

        // Update local order
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            tracking_number: eventData.shipment?.tracking_number,
            completed_at: new Date().toISOString()
          })
          .eq('id', printfulOrder.order_id);
        break;

      case 'package_returned':
        newStatus = 'cancelled';
        await supabase
          .from('printful_orders')
          .update({ status: 'returned' })
          .eq('id', printfulOrder.id);

        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', printfulOrder.order_id);
        break;

      case 'order_failed':
        newStatus = 'cancelled';
        await supabase
          .from('printful_orders')
          .update({ status: 'failed' })
          .eq('id', printfulOrder.id);

        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', printfulOrder.order_id);
        break;

      case 'order_updated':
        // Update order details
        await supabase
          .from('printful_orders')
          .update({
            status: eventData.order.status,
            costs: eventData.order.costs
          })
          .eq('id', printfulOrder.id);
        break;

      default:
        console.log('Unhandled webhook type:', type);
    }

    // Log the webhook event
    await supabase
      .from('printful_webhook_events')
      .insert({
        event_type: type,
        printful_order_id: eventData.order.external_id,
        order_id: printfulOrder.order_id,
        payload: webhookPayload,
        processed: true,
        processed_at: new Date().toISOString()
      });

    return {
      data: { status: newStatus },
      error: null
    };
  } catch (error) {
    console.error('Error handling Printful webhook:', error);

    // Log failed webhook event
    try {
      await supabase
        .from('printful_webhook_events')
        .insert({
          event_type: webhookPayload.type,
          printful_order_id: webhookPayload.data?.order?.external_id,
          payload: webhookPayload,
          processed: false,
          error_message: error.message
        });
    } catch (logError) {
      console.error('Error logging webhook event:', logError);
    }

    return {
      data: null,
      error: { message: error.message || 'Failed to process webhook' }
    };
  }
};

/**
 * Get Printful order status
 *
 * @param {string} orderId - Local order ID
 * @returns {Promise<{data: Object, error: Object|null}>}
 */
export const getPrintfulOrderStatus = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('printful_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: { message: error.message || 'Failed to get order status' }
    };
  }
};

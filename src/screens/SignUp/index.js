import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./SignUp.module.sass";
import { use100vh } from "react-div-100vh";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/TextInput";
import Image from "../../components/Image";
import { useAuth } from "../../contexts/AuthContext";

const items = [
  "Unlimited product uploads",
  "Pro tips",
  "Free forever",
  "Full author options",
];

const SignUp = () => {
  const heightWindow = use100vh();
  const navigate = useNavigate();
  const { register, user, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.password, {
      name: formData.name,
    });

    if (result.success) {
      if (result.needsConfirmation) {
        setSuccess(true);
        setError("Please check your email to confirm your account");
      } else {
        navigate("/");
      }
    } else {
      setError(result.error || "Failed to sign up");
    }

    setLoading(false);
  };

  return (
    <div className={styles.row}>
      <div className={styles.col}>
        <div className={styles.wrap}>
          <div className={styles.preview}>
            <img src="/images/content/login-pic.png" alt="Login" />
          </div>
          <div className={cn("h4", styles.subtitle)}>Plan includes</div>
          <ul className={styles.list}>
            {items.map((x, index) => (
              <li key={index}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.col} style={{ minHeight: heightWindow }}>
        <div className={styles.head}>
          <Link className={styles.logo} to="/">
            <Image
              className={styles.pic}
              src="/images/logo-dark.png"
              srcDark="/images/logo-light.png"
              alt="Core"
            />
          </Link>
          <div className={styles.info}>
            Already a member?{" "}
            <Link className={styles.link} to="/sign-in">
              Sign in
            </Link>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={cn("h2", styles.title)}>Sign up</div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.5rem", fontSize: "14px" }}>
                Sign up with Open account
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={cn("button-stroke", styles.button)}
                  disabled
                  style={{ flex: 1 }}
                >
                  <img src="/images/content/google.svg" alt="Google" />
                  Google
                </button>
                <button
                  type="button"
                  className={cn("button-stroke", styles.button)}
                  disabled
                  style={{ flex: 1 }}
                >
                  <Image
                    className={styles.pic}
                    src="/images/content/apple-dark.svg"
                    srcDark="/images/content/apple-light.svg"
                    alt="Apple"
                  />
                  Apple ID
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "1rem", fontSize: "14px" }}>
              Or continue with email address
            </div>
            {(error || authError) && (
              <div
                style={{
                  color: success ? "green" : "red",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {error || authError}
              </div>
            )}
            <TextInput
              className={styles.field}
              name="name"
              type="text"
              placeholder="Your name (optional)"
              icon="user"
              value={formData.name}
              onChange={handleChange}
            />
            <TextInput
              className={styles.field}
              name="email"
              type="email"
              placeholder="Your email"
              required
              icon="mail"
              value={formData.email}
              onChange={handleChange}
            />
            <TextInput
              className={styles.field}
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              required
              icon="lock"
              value={formData.password}
              onChange={handleChange}
            />
            <TextInput
              className={styles.field}
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              required
              icon="lock"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              className={cn("button", styles.button)}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "12px",
                color: "#777",
                textAlign: "center",
              }}
            >
              This site is protected by reCAPTCHA and the Google Privacy
              Policy.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

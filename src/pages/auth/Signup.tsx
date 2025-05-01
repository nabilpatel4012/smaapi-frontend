import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import TextInputWithIcon from "../../components/common/TextInputWithIcon";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  Building,
  ChevronDown,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "individual",
    plan_type: "SMAAPI_FREE",
    first_name: "",
    last_name: "",
    phone_number: "",
    company_name: "",
    company_email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      setError("Please fill in all required fields");
      return false;
    }

    if (
      formData.user_type === "business" &&
      (!formData.company_name || !formData.company_email)
    ) {
      setError("Company name and email are required for company accounts");
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    if (step === 1 && validateStep1()) {
      setError("");
      setStep(2);
    }
  };

  const goToPreviousStep = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      const {
        username,
        email,
        password,
        user_type,
        plan_type,
        first_name,
        last_name,
        phone_number,
        company_name,
        company_email,
      } = formData;

      const signupData = {
        username,
        email,
        password,
        user_type,
        plan_type,
        first_name,
        last_name,
        phone_number,
        ...(user_type === "business" && { company_name, company_email }),
      };

      await signup(signupData);
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      setError("Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <form
        onSubmit={
          step === 1
            ? (e) => {
                e.preventDefault();
                goToNextStep();
              }
            : handleSubmit
        }
      >
        {step === 1 && (
          <div className="space-y-4">
            <TextInputWithIcon
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              icon={<User className="h-5 w-5" />}
            />

            <TextInputWithIcon
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              icon={<Mail className="h-5 w-5" />}
            />

            <div className="relative">
              <TextInputWithIcon
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                icon={<Lock className="h-5 w-5" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <TextInputWithIcon
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                icon={<Lock className="h-5 w-5" />}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>

            <Button
              type="submit"
              fullWidth
              className="py-2.5 text-base font-medium rounded-lg mt-4"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <TextInputWithIcon
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First name"
              required
              icon={<User className="h-5 w-5" />}
            />
            <TextInputWithIcon
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last name"
              required
              icon={<User className="h-5 w-5" />}
            />
            <TextInputWithIcon
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              required
              icon={<Phone className="h-5 w-5" />}
            />

            {/* User Type Dropdown */}
            <div className="relative">
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="block w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="individual">Individual</option>
                <option value="business">Company</option>
              </select>
            </div>

            {/* Conditionally render company fields if user type is company */}
            {formData.user_type === "business" && (
              <>
                <TextInputWithIcon
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company name"
                  required
                  icon={<Building className="h-5 w-5" />}
                />
                <TextInputWithIcon
                  id="company_email"
                  name="company_email"
                  type="email"
                  value={formData.company_email}
                  onChange={handleChange}
                  placeholder="Company email"
                  required
                  icon={<Mail className="h-5 w-5" />}
                />
              </>
            )}

            <div className="flex items-center my-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                I agree to the{" "}
                <Link to="#" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<ArrowLeft size={16} />}
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
                className="py-2.5 text-base font-medium rounded-lg"
              >
                Create account
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:text-indigo-500 text-sm"
            >
              Log in
            </Link>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default Signup;

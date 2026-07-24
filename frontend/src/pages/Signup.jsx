import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password", "");

  const calculateStrength = (pw) => {
    let score = 0;
    if (!pw) return 0;
    if (pw.length > 7) score += 25;
    if (pw.match(/[a-z]/)) score += 25;
    if (pw.match(/[A-Z]/)) score += 25;
    if (pw.match(/[0-9!@#$%^&*]/)) score += 25;
    return score;
  };
  const strength = calculateStrength(passwordValue);

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      const skills = values.skills
        ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      await signup({ ...values, skills, age: Number(values.age) });
      navigate("/feed");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-brand-400 mb-1">{"<DevTinder />"}</h1>
        <p className="text-sm text-slate-400 mb-6">Create your developer profile.</p>

        {serverError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-3 py-2 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">First name</label>
              <input className="input-field" {...register("firstName", { required: "Required" })} />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Last name</label>
              <input className="input-field" {...register("lastName")} />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input type="email" className="input-field" {...register("email", { required: "Required" })} />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field pr-10" 
                {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            
            <div className="mt-2">
              <div className="flex gap-1 h-1.5 w-full">
                <div className={`flex-1 rounded-full transition-colors ${passwordValue ? (strength >= 25 ? 'bg-rose-500' : 'bg-slate-700') : 'bg-slate-800'}`}></div>
                <div className={`flex-1 rounded-full transition-colors ${passwordValue ? (strength >= 50 ? 'bg-amber-500' : 'bg-slate-700') : 'bg-slate-800'}`}></div>
                <div className={`flex-1 rounded-full transition-colors ${passwordValue ? (strength >= 75 ? 'bg-brand-500' : 'bg-slate-700') : 'bg-slate-800'}`}></div>
                <div className={`flex-1 rounded-full transition-colors ${passwordValue ? (strength >= 100 ? 'bg-emerald-500' : 'bg-slate-700') : 'bg-slate-800'}`}></div>
              </div>
              {passwordValue && (
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {strength < 50 ? "Weak" : strength < 100 ? "Good" : "Strong"}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Age</label>
              <input type="number" className="input-field" {...register("age", { required: "Required" })} />
              {errors.age && <p className="text-xs text-rose-400 mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Gender</label>
              <select className="input-field" {...register("gender")}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Profile photo URL</label>
            <input className="input-field" placeholder="https://..." {...register("photoUrl")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Location</label>
            <input className="input-field" placeholder="City, Country" {...register("location")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Skills (comma separated)</label>
            <input className="input-field" placeholder="React, Node.js, MongoDB" {...register("skills")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">About</label>
            <textarea rows={3} className="input-field" {...register("about")} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

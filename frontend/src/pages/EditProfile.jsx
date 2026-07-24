import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        photoUrl: user.photoUrl,
        location: user.location,
        about: user.about,
        skills: user.skills?.join(", "),
      });
    }
  }, [user, reset]);

  if (!user) return <Loader fullScreen />;

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        age: values.age ? Number(values.age) : undefined,
        skills: values.skills ? values.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const { data } = await api.patch("/profile/edit", payload);
      updateUser(data.data.user);
      navigate("/profile");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="card p-8">
        <h1 className="text-xl font-bold mb-6">Edit Profile</h1>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Age</label>
              <input type="number" className="input-field" {...register("age")} />
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
            <input className="input-field" {...register("photoUrl")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Location</label>
            <input className="input-field" {...register("location")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">Skills (comma separated)</label>
            <input className="input-field" {...register("skills")} />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block">About</label>
            <textarea rows={4} className="input-field" {...register("about")} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/profile")} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

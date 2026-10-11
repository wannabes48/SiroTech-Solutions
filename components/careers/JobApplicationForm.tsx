"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, X } from "lucide-react";

interface JobApplicationFormProps {
  roleSlug?: string;
  roleTitle?: string;
  heading?: string;
  subheading?: string;
}

export function JobApplicationForm({
  roleSlug,
  roleTitle,
  heading = "Submit Your Application",
  subheading = "Complete the details below. We review portfolios and engineering track records personally.",
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    message: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File is too large. Maximum size allowed is 5 MB.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileError("Please upload your CV / resume as a PDF document.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please provide your phone or WhatsApp contact number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("role", roleTitle || "General Application");
      data.append("portfolioUrl", formData.portfolioUrl.trim());
      data.append("message", formData.message.trim());

      if (selectedFile) {
        data.append("cv", selectedFile);
      }

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed. Please try again.");
      }

      setSuccessMessage(result.message || "Your application was submitted successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        portfolioUrl: "",
        message: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-rule p-8 sm:p-12 shadow-sm">
      <div className="mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">
          {heading}
        </h3>
        <p className="text-body text-sm sm:text-base leading-relaxed">
          {subheading}
        </p>
        {roleTitle && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 text-sage-800 text-xs font-bold">
            <span>Applying for:</span>
            <span className="text-ink">{roleTitle}</span>
          </div>
        )}
      </div>

      {successMessage ? (
        <div className="rounded-2xl bg-sage-50 border border-sage-300 p-8 text-center animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-sage-700 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-ink mb-2">Application Received</h4>
          <p className="text-body text-sm sm:text-base max-w-lg mx-auto mb-6">
            {successMessage}
          </p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="px-6 py-2.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field */}
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Mwangi"
                className="w-full bg-surface border border-rule rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Work / Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full bg-surface border border-rule rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 712 345 678"
                className="w-full bg-surface border border-rule rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Portfolio or LinkedIn / GitHub URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://github.com/username or linkedin.com/in/..."
                className="w-full bg-surface border border-rule rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>

          {/* CV / Resume Upload */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Attach Resume / CV (PDF, max 5 MB)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="cv-upload-input"
            />

            {!selectedFile ? (
              <label
                htmlFor="cv-upload-input"
                className="border-2 border-dashed border-rule hover:border-ink/50 bg-surface/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-ink mb-1">
                  Click to select your CV (PDF)
                </div>
                <div className="text-xs text-muted">
                  Max file size: 5 MB
                </div>
              </label>
            ) : (
              <div className="bg-sage-50 border border-sage-300 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-sage-200 flex items-center justify-center text-sage-800 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-ink truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-muted">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 rounded-full hover:bg-sage-200 text-muted hover:text-ink transition-colors ml-2"
                  aria-label="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="mt-2 text-xs text-red-600 font-medium">
                {fileError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Note or Summary of Experience
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about the most complex system you built or what problems you enjoy solving..."
              className="w-full bg-surface border border-rule rounded-2xl p-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

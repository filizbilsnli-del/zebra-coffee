"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  CalendarDays,
  GraduationCap,
  Save,
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";


type VerificationStatus = "pending" | "verified" | "rejected";

export default function ProfilePage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [studentStatus, setStudentStatus] = useState("not_student");

  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, az: string) => (isAZ ? az : en);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, birth_date, student_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(t("Could not load profile.", "Profil yüklənmədi."));
      } else if (data) {
        setFullName(data.full_name ?? "");
        setBirthDate(data.birth_date ?? "");
        setStudentStatus(data.student_status ?? "not_student");

        setIsStudent(
          data.student_status === "pending" ||
            data.student_status === "verified"
        );
      }

      const { data: verification } = await supabase
        .from("student_verifications")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (verification) {
        setVerificationStatus(verification.status as VerificationStatus);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, isAZ]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError(t("Please enter your full name.", "Ad və soyadını daxil et."));
      return;
    }

    if (!birthDate) {
      setError(t("Please select your birth date.", "Doğum tarixini seç."));
      return;
    }

    if (new Date(birthDate) > new Date()) {
      setError(
        t(
          "Birth date cannot be in the future.",
          "Doğum tarixi gələcək tarix ola bilməz."
        )
      );
      return;
    }

    setSaving(true);

    const newStudentStatus = isStudent
      ? studentStatus === "verified"
        ? "verified"
        : "pending"
      : "not_student";

    const { error: saveError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: fullName.trim(),
          birth_date: birthDate,
          student_status: newStudentStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    setSaving(false);

    if (saveError) {
      setError(
        t(
          "Could not save your profile. Please try again.",
          "Profil məlumatlarını saxlamaq mümkün olmadı."
        )
      );
      return;
    }

    setStudentStatus(newStudentStatus);

    setMessage(
      t(
        "Your profile has been saved successfully.",
        "Profil məlumatların uğurla saxlanıldı."
      )
    );

    setTimeout(() => router.push("/loyalty"), 1200);
  }

  async function uploadStudentDocument() {
    setMessage("");
    setError("");

    if (!selectedFile) {
      setError(
        t("Please select a document first.", "Əvvəlcə sənəd seç.")
      );
      return;
    }

    if (!userId) {
      setError(t("Please sign in again.", "Yenidən hesabına daxil ol."));
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        t(
          "Only PDF, JPG and PNG files are allowed.",
          "Yalnız PDF, JPG və PNG fayllarına icazə verilir."
        )
      );
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        t(
          "The file must be smaller than 5 MB.",
          "Faylın ölçüsü 5 MB-dan az olmalıdır."
        )
      );
      return;
    }

    setUploading(true);

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    const filePath = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("student-documents")
      .upload(filePath, selectedFile, {
        upsert: false,
        contentType: selectedFile.type,
      });

    if (uploadError) {
      setUploading(false);
      setError(
        t(
          "Document upload failed. Please try again.",
          "Sənəd yüklənmədi. Yenidən yoxla."
        )
      );
      return;
    }

    const { error: insertError } = await supabase
      .from("student_verifications")
      .insert({
        user_id: userId,
        file_path: filePath,
        status: "pending",
      });

    if (insertError) {
      setUploading(false);
      setError(
        t(
          "The document was uploaded, but the application could not be saved. Please contact support.",
          "Sənəd yükləndi, lakin müraciət qeydə alınmadı. Dəstəyə müraciət et."
        )
      );
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ student_status: "pending" })
      .eq("id", userId);

    setUploading(false);

    if (profileError) {
      setError(
        t(
          "Your document was submitted, but your profile status could not be updated.",
          "Sənədin göndərildi, lakin profil statusun yenilənmədi."
        )
      );
      return;
    }

    setStudentStatus("pending");
    setVerificationStatus("pending");
    setSelectedFile(null);

    setMessage(
      t(
        "Your student document was submitted successfully. It is waiting for review.",
        "Tələbə sənədin uğurla göndərildi. Hazırda yoxlanılmağı gözləyir."
      )
    );
  }

  function statusLabel(status: VerificationStatus) {
    if (status === "verified") {
      return t("Verified", "Təsdiqlənib");
    }

    if (status === "rejected") {
      return t("Rejected", "Rədd edilib");
    }

    return t("Pending review", "Yoxlanılır");
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] px-5 py-10 pb-28 text-[#38271f]">
      <div className="mx-auto max-w-xl">
        <Link
          href="/loyalty"
          className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-[#795b45]"
        >
          <ArrowLeft size={18} />
          {t("Back to rewards", "Bonuslara qayıt")}
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#553b2c] text-white">
            <UserRound size={30} />
          </div>

          <h1 className="text-3xl font-black">
            {t("Edit profile", "Profili redaktə et")}
          </h1>

          <p className="mt-3 text-sm text-[#987b65]">
            {t(
              "Update your personal information.",
              "Şəxsi məlumatlarını yenilə."
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
         <div className="space-y-6">
  

  <form
              onSubmit={saveProfile}
              className="space-y-6 rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm sm:p-9"
            >
              <div>
                <label className="mb-2 block text-sm font-bold">
                  {t("Full name", "Ad və soyad")}
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("Your full name", "Ad və soyadın")}
                  className="w-full rounded-xl border border-[#e5d8ca] bg-[#faf7f1] px-4 py-4 outline-none focus:border-[#795b45]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <CalendarDays size={17} />
                  {t("Date of birth", "Doğum tarixi")}
                </label>

                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-[#e5d8ca] bg-[#faf7f1] px-4 py-4 outline-none focus:border-[#795b45]"
                  required
                />
              </div>

              <div className="rounded-2xl bg-[#f7f3ed] p-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="h-5 w-5 accent-[#553b2c]"
                  />

                  <span className="flex items-center gap-2 font-bold">
                    <GraduationCap size={20} />
                    {t("I am a student", "Mən tələbəyəm")}
                  </span>
                </label>

                <p className="mt-3 text-xs leading-6 text-[#987b65]">
                  {t(
                    "Student discount is 10%. Your student status must be verified before the discount becomes active.",
                    "Tələbə endirimi 10%-dir. Endirimin aktivləşməsi üçün tələbə statusun təsdiqlənməlidir."
                  )}
                </p>

                {studentStatus === "verified" && isStudent && (
                  <p className="mt-3 text-sm font-bold text-green-700">
                    {t(
                      "Your student status is verified.",
                      "Tələbə statusun təsdiqlənib."
                    )}
                  </p>
                )}

                {studentStatus === "pending" && isStudent && (
                  <p className="mt-3 text-sm font-bold text-yellow-700">
                    {t(
                      "Your application is pending.",
                      "Müraciətin yoxlanılır."
                    )}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#553b2c] px-6 py-4 font-bold text-white transition hover:bg-[#76533c] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={19} />
                ) : (
                  <Save size={19} />
                )}

                {saving
                  ? t("Saving...", "Saxlanılır...")
                  : t("Save changes", "Dəyişiklikləri saxla")}
              </button>
            </form>

            {isStudent && (
              <section className="rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm sm:p-9">
                <div className="mb-5 flex items-center gap-3">
                  <GraduationCap
                    size={25}
                    className="text-[#987253]"
                  />
                  <h2 className="text-xl font-black">
                    {t("Student verification", "Tələbə təsdiqi")}
                  </h2>
                </div>

                <p className="mb-5 text-sm leading-6 text-[#987b65]">
                  {t(
                    "Upload a valid student document to apply for the 10% student discount. Accepted formats: PDF, JPG and PNG. Maximum size: 5 MB.",
                    "10% tələbə endirimi üçün etibarlı tələbə sənədini yüklə. Qəbul edilən formatlar: PDF, JPG və PNG. Maksimum ölçü: 5 MB."
                  )}
                </p>

                {verificationStatus && (
                  <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#f7f3ed] p-4">
                    {verificationStatus === "verified" ? (
                      <CheckCircle className="text-green-700" />
                    ) : verificationStatus === "rejected" ? (
                      <XCircle className="text-red-600" />
                    ) : (
                      <Clock className="text-yellow-700" />
                    )}

                    <div>
                      <p className="text-xs text-[#987b65]">
                        {t("Application status", "Müraciətin statusu")}
                      </p>
                      <p className="text-sm font-bold">
                        {statusLabel(verificationStatus)}
                      </p>
                    </div>
                  </div>
                )}

                {verificationStatus !== "verified" && (
                  <>
                    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cdbba8] bg-[#faf7f1] p-5">
                      <FileText
                        size={25}
                        className="shrink-0 text-[#795b45]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">
                          {selectedFile
                            ? selectedFile.name
                            : t("Choose student document", "Tələbə sənədi seç")}
                        </p>
                        <p className="mt-1 text-xs text-[#987b65]">
                          {t(
                            "PDF, JPG or PNG · Max 5 MB",
                            "PDF, JPG və ya PNG · Maksimum 5 MB"
                          )}
                        </p>
                      </div>

                      <Upload size={20} />

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={uploadStudentDocument}
                      disabled={uploading || !selectedFile}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#795b45] px-6 py-4 font-bold text-white transition hover:bg-[#553b2c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="animate-spin" size={19} />
                      ) : (
                        <Upload size={19} />
                      )}

                      {uploading
                        ? t("Uploading...", "Yüklənir...")
                        : t("Submit document", "Sənədi göndər")}
                    </button>
                  </>
                )}
              </section>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
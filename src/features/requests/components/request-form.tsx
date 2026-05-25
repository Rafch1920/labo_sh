"use client";

import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import { createRequest, updateRequest } from "@/features/requests/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Upload, X, FileText, IdCard, ClipboardList, Microscope } from "lucide-react";

type Step = "personal" | "medical" | "documents";

type FormDataState = {
  patient_first_name: string;
  patient_last_name: string;
  patient_dob: string;
  patient_gender: string;
  patient_address: string;
  patient_phone: string;
  physician_name: string;
  physician_address: string;
  physician_phone: string;
  physician_email: string;
  medical_remarks: string;
};

type FileCategory = "identity_document" | "prescription" | "medical_report" | "stone_image" | "additional";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  path: string;
  url: string;
  category: FileCategory;
};

const CATEGORIES: { key: FileCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "identity_document", label: "Pièce d'identité", icon: <IdCard className="w-10 h-10" />, description: "Carte d'identité ou passeport" },
  { key: "prescription", label: "Prescription médicale", icon: <ClipboardList className="w-10 h-10" />, description: "Ordonnance du médecin prescripteur" },
  { key: "medical_report", label: "Compte-rendu médical", icon: <FileText className="w-10 h-10" />, description: "Rapports médicaux antérieurs" },
  { key: "stone_image", label: "Image du calcul", icon: <Microscope className="w-10 h-10" />, description: "Photo ou scan du calcul" },
  { key: "additional", label: "Autre document", icon: <FileText className="w-10 h-10" />, description: "Tout document complémentaire" },
];

const STEPS: { key: Step; label: string }[] = [
  { key: "personal", label: "Informations" },
  { key: "medical", label: "Médical" },
  { key: "documents", label: "Documents" },
];

type RequestFormProps = {
  initialData?: FormDataState;
  requestId?: string;
};

export function RequestForm({ initialData, requestId }: RequestFormProps = {}) {
  const [step, setStep] = useState<Step>("personal");
  const actionFn = requestId
    ? (prev: { error: string | null }, fd: FormData) => updateRequest(requestId, prev, fd)
    : createRequest;
  const [state, action, pending] = useActionState(actionFn, { error: null });
  const [uploading, setUploading] = useState<FileCategory | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeCategory, setActiveCategory] = useState<FileCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState<FormDataState>(
    initialData ?? {
      patient_first_name: "",
      patient_last_name: "",
      patient_dob: "",
      patient_gender: "",
      patient_address: "",
      patient_phone: "",
      physician_name: "",
      physician_address: "",
      physician_phone: "",
      physician_email: "",
      medical_remarks: "",
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});

  const updateField = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  function validatePersonal(): boolean {
    const newErrors: Partial<Record<keyof FormDataState, string>> = {};
    if (!formData.patient_last_name.trim()) newErrors.patient_last_name = "Requis";
    if (!formData.patient_first_name.trim()) newErrors.patient_first_name = "Requis";
    if (!formData.patient_dob) newErrors.patient_dob = "Requis";
    if (!formData.patient_gender) newErrors.patient_gender = "Requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateMedical(): boolean {
    const newErrors: Partial<Record<keyof FormDataState, string>> = {};
    if (!formData.physician_name.trim()) newErrors.physician_name = "Requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const goToStep = (index: number) => {
    if (index >= 0 && index < STEPS.length) {
      setStep(STEPS[index].key);
    }
  };

  function handleNext(): void {
    if (step === "personal" && validatePersonal()) {
      goToStep(currentStepIndex + 1);
    } else if (step === "medical" && validateMedical()) {
      goToStep(currentStepIndex + 1);
    }
  }

  async function handleFileUpload(category: FileCategory, files: FileList | null) {
    if (!files?.length) return;
    setUploading(category);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    for (const file of files) {
      const fileId = crypto.randomUUID();
      const filePath = `${user.id}/${category}/${fileId}-${file.name}`;

      const { error } = await supabase.storage
        .from("request-documents")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      setUploadedFiles((prev) => [
        ...prev,
        { id: fileId, name: file.name, size: file.size, path: filePath, url: previewUrl, category },
      ]);
    }

    setUploading(null);
    setActiveCategory(null);
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => {
      const removed = prev.find((f) => f.id === fileId);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((f) => f.id !== fileId);
    });
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = uploadedFiles.map((f) => f.url);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form action={action} className="space-y-8">
      {state?.error && (
        <div className="p-3 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => goToStep(i)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
              i === currentStepIndex
                ? "bg-[#1e3a5f] text-white font-medium shadow-sm"
                : i < currentStepIndex
                  ? "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  : "text-stone-300"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-1 ${
              i === currentStepIndex
                ? "bg-white/20"
                : i < currentStepIndex
                  ? "bg-stone-200 text-stone-500"
                  : "bg-stone-100 text-stone-300"
            }`}>
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === "personal" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1e3a5f]">Informations personnelles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient_last_name">
                Nom <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="patient_last_name"
                name="patient_last_name"
                value={formData.patient_last_name}
                onChange={(e) => updateField("patient_last_name", e.target.value)}
                className={errors.patient_last_name ? "border-amber-300 focus-visible:ring-red-400" : ""}
              />
              {errors.patient_last_name && <p className="text-xs text-amber-600">{errors.patient_last_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_first_name">
                Prénom <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="patient_first_name"
                name="patient_first_name"
                value={formData.patient_first_name}
                onChange={(e) => updateField("patient_first_name", e.target.value)}
                className={errors.patient_first_name ? "border-amber-300 focus-visible:ring-red-400" : ""}
              />
              {errors.patient_first_name && <p className="text-xs text-amber-600">{errors.patient_first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_dob">
                Date de naissance <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="patient_dob"
                name="patient_dob"
                type="date"
                value={formData.patient_dob}
                onChange={(e) => updateField("patient_dob", e.target.value)}
                className={errors.patient_dob ? "border-amber-300 focus-visible:ring-red-400" : ""}
              />
              {errors.patient_dob && <p className="text-xs text-amber-600">{errors.patient_dob}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_gender">
                Genre <span className="text-amber-500">*</span>
              </Label>
              <Select
                value={formData.patient_gender}
                onValueChange={(v) => updateField("patient_gender", v ?? "")}
              >
                <SelectTrigger className={errors.patient_gender ? "border-amber-300 focus-visible:ring-red-400" : ""}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                </SelectContent>
              </Select>
              {errors.patient_gender && <p className="text-xs text-amber-600">{errors.patient_gender}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_phone">Téléphone</Label>
              <Input
                id="patient_phone"
                name="patient_phone"
                type="tel"
                value={formData.patient_phone}
                onChange={(e) => updateField("patient_phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_address">Adresse</Label>
              <Input
                id="patient_address"
                name="patient_address"
                value={formData.patient_address}
                onChange={(e) => updateField("patient_address", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={handleNext} className="bg-[#1e3a5f] hover:bg-[#2a4a73] text-white">
              Suivant <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Medical & Physician Info */}
      {step === "medical" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1e3a5f]">Informations médicales</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="physician_name">
                Médecin prescripteur <span className="text-amber-500">*</span>
              </Label>
              <Input
                id="physician_name"
                name="physician_name"
                value={formData.physician_name}
                onChange={(e) => updateField("physician_name", e.target.value)}
                className={errors.physician_name ? "border-amber-300 focus-visible:ring-red-400" : ""}
              />
              {errors.physician_name && <p className="text-xs text-amber-600">{errors.physician_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="physician_phone">Téléphone du médecin</Label>
              <Input
                id="physician_phone"
                name="physician_phone"
                type="tel"
                value={formData.physician_phone}
                onChange={(e) => updateField("physician_phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physician_email">Email du médecin</Label>
              <Input
                id="physician_email"
                name="physician_email"
                type="email"
                value={formData.physician_email}
                onChange={(e) => updateField("physician_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physician_address">Adresse du médecin</Label>
              <Input
                id="physician_address"
                name="physician_address"
                value={formData.physician_address}
                onChange={(e) => updateField("physician_address", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medical_remarks">Remarques médicales</Label>
            <Textarea
              id="medical_remarks"
              name="medical_remarks"
              rows={4}
              value={formData.medical_remarks}
              onChange={(e) => updateField("medical_remarks", e.target.value)}
            />
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => goToStep(currentStepIndex - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <Button type="button" onClick={handleNext} className="bg-[#1e3a5f] hover:bg-[#2a4a73] text-white">
              Suivant <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Documents & Submit */}
      {step === "documents" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1e3a5f]">Documents</h2>
          <p className="text-sm text-stone-500">
            Ajoutez les documents nécessaires par catégorie.
          </p>

          {/* Hidden inputs for all form data */}
          {(["patient_first_name", "patient_last_name", "patient_dob", "patient_gender", "patient_address", "patient_phone", "physician_name", "physician_address", "physician_phone", "physician_email", "medical_remarks"] as const).map((f) => (
            <input key={f} type="hidden" name={f} value={formData[f] ?? ""} />
          ))}

          {/* Category cards */}
          <div className="grid gap-3">
            {CATEGORIES.map((cat) => {
              const filesForCat = uploadedFiles.filter((f) => f.category === cat.key);
              return (
                  <div
                    key={cat.key}
                    className="border border-stone-200 rounded-xl p-5 space-y-4 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-stone-400">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-stone-700">{cat.label}</p>
                        <p className="text-xs text-stone-400">{cat.description}</p>
                      </div>
                      {filesForCat.length > 0 && (
                        <span className="text-xs text-stone-500 bg-stone-50 px-2.5 py-1 rounded-full font-medium">
                          {filesForCat.length} fichier{filesForCat.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Uploaded files for this category */}
                    {filesForCat.length > 0 && (
                      <div className="space-y-1.5">
                        {filesForCat.map((file) => (
                          <div
                            key={file.id}
                            className="group relative flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg text-sm hover:bg-stone-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {file.url.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                                <img src={file.url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                              )}
                              <span className="truncate text-xs text-stone-600">{file.name}</span>
                            </div>
                            {/* Preview on hover */}
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
                              <div className="bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden" style={{ width: "280px", maxHeight: "320px" }}>
                                {/\.(png|jpe?g|gif|webp)$/i.test(file.name) ? (
                                  <img src={file.url} alt={file.name} className="w-full h-52 object-cover bg-stone-100" />
                                ) : /\.pdf$/i.test(file.name) ? (
                                  <div className="flex flex-col items-center justify-center h-52 bg-stone-50 p-4">
                                    <FileText className="w-16 h-16 text-stone-300 mb-3" />
                                    <p className="text-xs text-stone-500 text-center">Document PDF</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-52 bg-stone-50 p-4">
                                    <FileText className="w-16 h-16 text-stone-300 mb-3" />
                                    <p className="text-xs text-stone-500 text-center">{file.name}</p>
                                  </div>
                                )}
                                <div className="px-3 py-2 border-t border-stone-100 bg-white">
                                  <p className="text-xs text-stone-700 truncate font-medium">{file.name}</p>
                                  <p className="text-[10px] text-stone-400">{cat.label} — {(file.size / 1024).toFixed(1)} Ko</p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="text-stone-400 hover:text-amber-600 shrink-0 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button for this category */}
                    {activeCategory !== cat.key && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                        disabled={uploading !== null}
                        onClick={() => {
                          setActiveCategory(cat.key);
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {filesForCat.length > 0 ? "Ajouter un fichier" : "Sélectionner un fichier"}
                      </Button>
                    )}

                    {uploading === cat.key && (
                      <p className="text-xs text-stone-400 text-center">Upload en cours...</p>
                    )}
                  </div>
              );
            })}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (activeCategory) {
                handleFileUpload(activeCategory, e.target.files);
              }
            }}
          />

          {/* Hidden inputs for uploaded files */}
          {uploadedFiles.map((f) => (
            <div key={f.id}>
              <input type="hidden" name="file_paths" value={f.path} />
              <input type="hidden" name="file_names" value={f.name} />
              <input type="hidden" name="file_sizes" value={String(f.size)} />
              <input type="hidden" name="file_categories" value={f.category} />
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => goToStep(currentStepIndex - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <Button type="submit" disabled={pending || uploading !== null} className="bg-[#1e3a5f] hover:bg-[#2a4a73] text-white">
              {pending ? "Création..." : "Créer la demande"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

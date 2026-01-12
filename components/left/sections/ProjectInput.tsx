"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { BiBook } from "react-icons/bi";
import { Pencil, Trash2 } from "lucide-react";
import { useProjectStore } from "@/app/store";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ================= AI PROMPT ================= */

const buildProjectDescriptionPrompt = (
  title: string,
  description: string
) => `
    You are a senior technical resume writer for software engineers.

    Context (for understanding only, DO NOT mention the project name or title in the output):
      Project Title: "${title}"
      Project Notes: "${description}"

    TASK:
      - Generate EXACTLY 6 different project descriptions
      - EACH description MUST be between 45 and 60 words (strict)
      - DO NOT mention the project name or title
      - Focus heavily on:
        - Tech stack
        - Architecture
        - APIs
        - Performance
        - Security
        - Scalability
      - Use strong action verbs
      - Resume-style, ATS-friendly language
      - Do NOT use phrases like "this project" or "the application"

    RESTRICTIONS:
      - No emojis
      - No bullet points
      - No numbering
      - No headings

    OUTPUT FORMAT:
    Retu  rn ONLY a valid JSON array of 6 strings.
`.trim();

/* ================= COMPONENT ================= */

export default function ProjectInput() {
  const { projects, addProject, updateProject, deleteProject } =
    useProjectStore();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    website: "",
    description: "",
  });

  /* ================= AI STATE ================= */

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [roughDescription, setRoughDescription] = useState("");

  /* ================= GEMINI SETUP ================= */

  useEffect(() => {
    const keyFromLocal = localStorage.getItem("api_key");
    if (!keyFromLocal) {
      console.warn("No Gemini API key found in localStorage (api_key).");
    }
    setApiKey(keyFromLocal);
  }, []);

  const geminiClient = useMemo(() => {
    if (!apiKey) return null;
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch {
      return null;
    }
  }, [apiKey]);

  /* ================= AI GENERATION ================= */

  const generateAISuggestions = useCallback(async () => {
    if (!geminiClient || !formData.name) return;

    const baseDescription =
      formData.description.trim() && roughDescription.trim()
        ? `${formData.description.trim()}\n\n${roughDescription.trim()}`
        : (formData.description.trim() || roughDescription.trim());

    if (!baseDescription) {
      alert("Please enter a rough description...");
      return;
    }

    try {
      setAiLoading(true);
      setAiSuggestions([]);

      const model = geminiClient.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const prompt = buildProjectDescriptionPrompt(
        formData.name,
        baseDescription
      );

      const response = await model.generateContent(prompt);
      const text =
        response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Invalid Gemini response");

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed) || parsed.length !== 6)
        throw new Error("Invalid suggestion count");

      setAiSuggestions(parsed);
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setAiLoading(false);
    }
  }, [geminiClient, formData.name, formData.description, roughDescription]);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetAIState = () => {
    setAiOpen(false);
    setAiSuggestions([]);
    setRoughDescription("");
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.description) return;

    if (editId) {
      updateProject(
        editId,
        formData.name,
        formData.description,
        formData.date,
        formData.website
      );
    } else {
      addProject(
        formData.name,
        formData.description,
        formData.website,
        formData.date
      );
    }

    setFormData({ name: "", date: "", website: "", description: "" });
    setEditId(null);
    resetAIState();
    setIsOpen(false);
  };

  const handleEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    resetAIState();

    setFormData({
      name: project.name,
      date: project.date,
      website: project.website,
      description: project.description,
    });

    setEditId(id);
    setIsOpen(true);
  };

  /* ================= UI ================= */

  return (
    <section className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-main-bg via-[rgba(17,1,30,0.95)] to-main-bg text-text-subtitle shadow-2xl rounded-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BiBook className="text-2xl text-white drop-shadow-glow" />
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Projects
          </h2>
        </div>
      </div>

      {/* Display Projects List */}
      {projects.length > 0 && (
        <div className="mb-6 space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 bg-gray-800/50 backdrop-blur-md rounded-xl flex justify-between items-center transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <div>
                <strong className="text-lg font-semibold text-white drop-shadow-md">
                  {project.name}
                </strong>
                <p className="text-sm text-gray-300">{project.date}</p>
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs underline hover:text-blue-300"
                  >
                    View Project
                  </a>
                )}
                <p className="text-xs text-gray-500">{project.description}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(project.id)}
                  className="p-2 rounded-full bg-blue-600/20 hover:bg-blue-600/40 transition-all duration-300"
                >
                  <Pencil className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Project Button */}
      <button
        onClick={() => {
          resetAIState();
          setFormData({ name: "", date: "", website: "", description: "" });
          setEditId(null);
          setIsOpen(true);
        }}
        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 bg-[rgba(255,255,255,0.05)] backdrop-blur-md hover:border-gray-500 hover:text-white transition-all duration-300 shadow-inner hover:shadow-glow"
      >
        + Add a new project
      </button>

      {/* Project Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50">
          <div className="bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] text-white p-8 rounded-2xl w-full max-w-[650px] shadow-2xl backdrop-blur-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {editId ? "Edit Project" : "Add Project"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-300"
              >
                <FaTimes size={20} className="text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 mb-6">

                <input
                  type="text"
                  name="name"
                  placeholder="Project Name"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="date"
                  name="date"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.date}
                  onChange={handleChange}
                  onFocus={(e) => e.target.showPicker()}
                  required
                />

                <input
                  type="url"
                  name="website"
                  placeholder="Project Website (Optional)"
                  className="w-full p-3 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              {/* Description Textarea + AI Button */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">
                    Project Description
                  </span>
                  <button
                    type="button"
                    disabled={!formData.name}
                    onClick={() => {
                      resetAIState();
                      setRoughDescription(formData.description);
                      setAiOpen(true);
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:opacity-40 transition-all duration-300"
                  >
                    ✨ AI Suggestions
                  </button>
                </div>

                <textarea
                  name="description"
                  className="w-full p-4 bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] border border-gray-700 rounded-lg min-h-[160px] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 shadow-inner hover:shadow-glow"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0eae95] text-white rounded-lg shadow-md hover:shadow-glow transition-all duration-300"
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {aiOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-[60]">
          <div className="bg-gradient-to-b from-[#0F011E] via-[rgba(17,1,30,0.95)] to-[#0F011E] text-white p-6 rounded-2xl w-full max-w-3xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                AI Project Description Suggestions
              </h3>
              <button onClick={() => setAiOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {!aiSuggestions.length ? (
              <>
                <textarea
                  className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 min-h-[120px]"
                  placeholder="Enter rough project description..."
                  value={roughDescription}
                  onChange={(e) => setRoughDescription(e.target.value)}
                />
                <button
                  onClick={generateAISuggestions}
                  disabled={aiLoading}
                  className="mt-4 px-5 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300"
                >
                  {aiLoading ? "Generating..." : "Generate AI Suggestions"}
                </button>
              </>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {aiSuggestions.map((desc, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setFormData({ ...formData, description: desc });
                      setAiOpen(false);
                    }}
                    className="p-4 border border-gray-700 rounded-lg hover:bg-purple-600/10 cursor-pointer transition-all duration-300"
                  >
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

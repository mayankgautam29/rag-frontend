"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiPage() {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [data, setData] = useState("");
  const [answer, setAnswer] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadPDF = async () => {
    if (!pdf) {
      toast.error("No file selected", {
        description: "Please select a PDF to upload.",
      });
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", pdf);

    try {
      await axios.post(
        "https://rag-backend-eor6.onrender.com/indexing",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUploaded(true);
      toast.success("Upload successful", {
        description: "PDF has been indexed.",
      });
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const askQuery = async () => {
    if (!data.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://rag-backend-eor6.onrender.com/query",
        {
          prompt: data,
        }
      );
      setAnswer(res.data.answer);
      toast.success("Query answered", {
        description: "Check the result below.",
      });
    } catch (err) {
      console.error("Query error:", err);
      toast.error("Something went wrong", { description: "Try asking again." });
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPdf(null);
    setData("");
    setAnswer("");
    setUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast("Reset complete", { description: "File and question cleared." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 px-4 py-10">
      <h1 className="text-white text-4xl font-bold text-center mb-8">My RAG</h1>

      <div className="max-w-xl mt-40 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-8 text-white space-y-6">
        <div className="space-y-2">
          <Label>Upload a PDF</Label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            disabled={loading || uploaded}
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={uploadPDF}
              disabled={loading || uploaded || !pdf}
              className="w-full"
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetAll}
              disabled={loading}
            >
              Reset
            </Button>
          </div>
          {uploaded && (
            <Badge variant="outline" className="bg-green-500 text-white mt-2">
              ✅ Upload Complete
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ask a question</Label>
          <Input
            type="text"
            placeholder="Enter your query"
            disabled={!uploaded || loading}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Button
            onClick={askQuery}
            disabled={!uploaded || !data || loading}
            className="w-full"
          >
            Ask
          </Button>
        </div>

        {answer && (
          <div className="mt-4 border border-white/20 bg-black/70 rounded-lg p-4">
            <h2 className="font-bold text-lg mb-2 text-green-400">Answer:</h2>
            <ReactMarkdown
              children={answer}
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return inline ? (
                    <code className="bg-gray-800 text-green-400 px-1 rounded">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

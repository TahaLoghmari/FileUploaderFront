import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";

export default function SharedFileView() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/share/${token}`)
      .then((response) => {
        if (!response.ok) throw new Error("Invalid or expired share link");
        return response.json();
      })
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
        <p className="ml-2">Loading shared file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-card p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const contentType = file.contentType;

    if (contentType.startsWith("image/")) {
      return (
        <img
          src={file.uploadPath}
          alt={file.name}
          className="max-w-full max-h-[70vh] object-contain"
        />
      );
    } else if (contentType === "application/pdf") {
      return (
        <iframe
          src={file.uploadPath}
          width="100%"
          height="70vh"
          title={file.name}
          className="border-0"
        />
      );
    } else {
      // For other file types, offer download
      return (
        <div className="text-center">
          <p>This file type cannot be previewed directly.</p>
          <a
            href={file.uploadPath}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Open File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{file.name}</h1>
          <a
            href={file.uploadPath}
            download={file.name}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Download
          </a>
        </div>
        <div className="bg-secondary p-4 rounded-md">{renderContent()}</div>
      </div>
    </div>
  );
}

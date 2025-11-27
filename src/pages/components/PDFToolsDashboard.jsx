import React from "react";
import {
  Edit3,
  Minimize2,
  Layers,
  Scissors,
  PenTool,
  Trash2,
  FileText,
  Sheet,
  Image,
  FilePlus,
  Lock,
  Droplet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PDFToolsDashboard = () => {
  const navigate = useNavigate();
  const toolCategories = [
    {
      title: "Most Popular",
      tools: [
        {
          name: "PDF Editor",
          description:
            "Edit PDF files for free. Fill & sign PDF. Add text, links, images and shapes.",
          icon: Edit3,
          path: "/pdf-editor",
        },
        {
          name: "Compress",
          description:
            "Reduce the size of your PDF files without losing quality.",
          icon: Minimize2,
          path: "/compress-pdf",
        },
        {
          name: "Merge",
          description: "Combine multiple PDFs and images into one document.",
          icon: Layers,
          path: "/merge-pdf",
        },
        {
          name: "Split",
          description:
            "Split specific page ranges or extract every page into separate documents.",
          icon: Scissors,
          path: "/split-pdf",
        },
      ],
    },
    {
      title: "Delete ",
      tools: [
        // {
        //   name: "Fill & Sign",
        //   description: "Add signature to PDF. Fill out PDF forms easily.",
        //   icon: PenTool,
        //   path: "/fill-sign-pdf",
        // },
        {
          name: "Delete Pages",
          description: "Remove pages from a PDF document with ease.",
          icon: Trash2,
          path: "/delete-pages-pdf",
        },
      ],
    },
    {
      title: "Convert from PDF",
      tools: [
        {
          name: "PDF to Word",
          description: "Convert from PDF to DOC online with high accuracy.",
          icon: FileText,
          path: "/pdf-to-word",
        },
        {
          name: "PDF to Excel",
          description: "Convert PDF to Excel or CSV online for free.",
          icon: Sheet,
          path: "/pdf-to-excel",
        },
        {
          name: "PDF to JPG",
          description: "Get PDF pages converted to JPG, PNG or TIFF images.",
          icon: Image,
          path: "/pdf-to-jpg",
        },
      ],
    },
    {
      title: "Convert to PDF",
      tools: [
        {
          name: "JPG to PDF",
          description: "Convert Images to PDF documents quickly.",
          icon: FilePlus,
          path: "/jpg-to-pdf",
        },
        {
          name: "Word to PDF",
          description: "Creates a PDF document from Microsoft Word .docx.",
          icon: FileText,
          path: "/word-to-pdf",
        },
      ],
    },
    {
      title: "Security",
      tools: [
        {
          name: "Protect",
          description: "Protect file with password and permissions.",
          icon: Lock,
          path: "/protect-pdf",
        },
        {
          name: "Watermark",
          description: "Add image or text watermark to PDF documents.",
          icon: Droplet,
          path: "/watermark",
        },
      ],
    },
  ];

  const handleToolClick = (toolPath) => {
    navigate(toolPath);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Tools</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Edit, convert, compress, and manage your PDF files with our
            comprehensive suite of tools
          </p>
        </header>

        {toolCategories.map((category, index) => (
          <ToolCategory
            key={index}
            title={category.title}
            tools={category.tools}
            onToolClick={handleToolClick}
          />
        ))}
      </div>
    </div>
  );
};

const ToolCategory = ({ title, tools, onToolClick }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            tool={tool}
            onClick={() => onToolClick(tool.path)}
          />
        ))}
      </div>
    </section>
  );
};

const ToolCard = ({ tool, onClick }) => {
  const [isRippling, setIsRippling] = React.useState(false);
  const [rippleStyle, setRippleStyle] = React.useState({});
  const IconComponent = tool.icon;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    setRippleStyle({
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
    });

    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600);

    onClick();
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer relative transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg  bg-gray-800 flex items-center justify-center mb-4 transition-transform duration-300">
          <IconComponent className="text-white" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {tool.name}
        </h3>
        <p className="text-gray-600 text-sm">{tool.description}</p>
      </div>

      {isRippling && (
        <div
          className="absolute rounded-full bg-green-200 opacity-30 pointer-events-none"
          style={{
            ...rippleStyle,
            animation: "ripple 0.6s ease-out",
          }}
        />
      )}

      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFToolsDashboard;

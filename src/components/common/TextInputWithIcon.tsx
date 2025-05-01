import React from "react";

interface TextInputWithIconProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon: React.ReactNode;
}

const TextInputWithIcon: React.FC<TextInputWithIconProps> = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
}) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-indigo-500">
      <div className="pl-3 text-gray-400">{icon}</div>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 py-2.5 ml-2 px-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-transparent"
        style={{
          all: "unset",
          width: "100%",
          padding: "10px",
          paddingLeft: "5px !important",
        }}
      />
    </div>
  );
};

export default TextInputWithIcon;

import { useState } from "react";
import { toast } from "react-toastify";
import FaceDetection from "../../Components/FaceDetection";
import RegistrationForm from "../../Components/RegistrationForm";

const Employee = () => {
  const [faceDetect, setFaceDetect] = useState(false);
  const [form, setForm] = useState(false);
  const [embeddings, setEmbeddings] = useState(null);

  const handleAddEmployee = () => {
    setFaceDetect(true); // Show FaceDetection component
    setForm(false); // Hide RegistrationForm
    setEmbeddings(null); // Reset embeddings
  };


  const handleFaceDetected = (embeddingData) => {
    if (embeddingData) {
      setEmbeddings(embeddingData);
      setFaceDetect(false); // Hide FaceDetection
      setForm(true); // Show RegistrationForm
      toast.success("Face detected successfully! Proceeding to registration.");
    } else {
      toast.error("Face detection failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 items-start bg-gray-200 p-2">
        <h1>Hello Branch Manager.</h1>
        <h1>Add an Employee to your Branch from here.</h1>
        <button
          onClick={handleAddEmployee}
          className="bg-violet-950 rounded p-2 text-white"
        >
          Add New Employee
        </button>
      </div>

      {faceDetect && <FaceDetection setEmbeddings={handleFaceDetected} />}
      {form && <RegistrationForm embeddings={embeddings} setForm={setForm} />}
    </div>
  );
};

export default Employee;

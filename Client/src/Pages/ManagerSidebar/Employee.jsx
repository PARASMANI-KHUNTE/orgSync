// import { useNavigate } from "react-router-dom";
import  { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import api from "../../utils/api";

const Employee= () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [employeeId,setEmployeeId] = useState('')


   // Decode the token to get the userId
   useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    }

  
  }, []);

  // Function to move to the next step
  const handleNext = () => {

    setCurrentStep((prevStep) => prevStep + 1);
  };

  const [newEmployee,setNewEmployee] = useState(null)
  const handelAddEmployee = async ()=>{
    if(newEmployee){
      setNewEmployee(false)
    }else{
      setNewEmployee(true)
    }
    
  }
  // const navigate = useNavigate();


  //shift form
  const [departments, setDepartments] = useState([]);

  const [formSData, setFormSData] = useState({
    department: "",
    shift: "",
    task: "",
  });

    
   

  const handleSChange = (e) => {
    setFormSData({ ...formSData, [e.target.name]: e.target.value });
  };

  const handleSSubmit = async (e) => {
    e.preventDefault();
    

    try {
        const response =  await api.post("/employers/submit-registration", {formSData,employeeId}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("response - ", response)
        if(response.data.success){
          toast.success("Registration successful");
        setCurrentStep(0)
        newEmployee(false)
        }else{
          toast.error(response.data.message)
        }
        
    } catch (error) {
      console.log(error)
        toast.error("Error submitting registration");
   
    }
};

  //otp
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/users/verify-otp", { email : formData.email, otp }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.status === 200) {
        try {
          const response = await api.post("/employers/getDepartment",{id : userId},{
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            });
          setDepartments(response.data.departments);
        } catch (error) {
          toast.error("Error fetching departments");
        }
        toast.success("OTP verified successfully!");
        
        handleNext()

      } else {
        toast.error(response.data.message || "Invalid OTP, please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // //personal info
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      toast.error("Employee ID is missing. Please capture your face first.");
      return;
    }

    try {
      const response = await api.post("/employers/addEmployee", {
        ...formData,
        employeeId, // Send the employeeId to associate this user with the face data
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 201) { 
        toast.success(response.data.message);
        handleNext()
      } 
    } catch (error) {
      console.error("Error adding employee:", error);
      // toast.error(error.response?.data?.message || "Error checking user. Please try again.");
    }
  };


  //ml 


  const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
   const [userId, setUserId] = useState("");
  
   
    useEffect(() => {
      const loadModels = async () => {
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri("/weights");
          await faceapi.nets.faceLandmark68Net.loadFromUri("/weights");
          await faceapi.nets.faceRecognitionNet.loadFromUri("/weights");
          console.log("Models loaded successfully");
          setModelsLoaded(true);
        } catch (error) {
          console.error("Error loading models:", error);
        }
      };
      loadModels();
    }, []);
  
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraOn(true);
          }
        })
        .catch((err) => console.error("Error starting camera:", err));
    };
  
    const stopVideo = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraOn(false);
      }
    };
  
    const captureFace = async () => {
      if (!modelsLoaded) {
        toast("Face detection models are still loading. Please wait.");
        return;
      }
      if (!videoRef.current || !canvasRef.current) return;
  
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
           await sendEmbeddingToBackend(detection.descriptor);
      
          stopVideo();
        } else {
          toast.error("No face detected. Please try again.");
        }
      } catch (error) {
        console.error("Error detecting face:", error);
        toast.error("Face detection failed. Ensure models are loaded and try again.");
      }
    };
  
    const sendEmbeddingToBackend = async (embedding) => {
        try {
          const response = await api.post("/employers/face-recognition", { embedding, id: userId }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log("Face embedding sent successfully:", response.data);
         if (response.data.success == true){
            handleNext()
            setEmployeeId(response.data.employeeId);
            setCapturedImage(null)
            toast.success(response.data.message)
          }else{
            toast.error(`Face Already Exist`)
            setCapturedImage(null)
          }
           // Store employeeId
        } catch (error) {
          console.error("Error sending embedding:", error);
        }
      };
  

  return (
 <>
   <div className="flex flex-col gap-2  p-6 rounded-lg shadow-lg">
   <div className="bg-white p-6 rounded-lg shadow-lg">
      <nav className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Add Employee </h2>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
          onClick={handelAddEmployee}
        >
          Add Employee
        </button>
      </nav>
      <p className="text-gray-600">Manage your employees here.</p>
    </div>
  { newEmployee && 
     <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
     <video ref={videoRef} autoPlay muted className="w-64 h-64 border rounded" hidden={!isCameraOn}></video>
     <canvas ref={canvasRef} style={{ display: "none" }} />
     {capturedImage && <img src={capturedImage} alt="Captured face" className="w-64 h-64 border rounded" />}
     <div className="flex space-x-4">
       {!isCameraOn ? (
         <button onClick={startVideo} className="bg-green-500 text-white px-4 py-2 rounded">Start Camera</button>
       ) : (
         <button onClick={stopVideo} className="bg-red-500 text-white px-4 py-2 rounded">Stop Camera</button>
       )}
       <button onClick={captureFace} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={!isCameraOn}>
         Capture Face
       </button>
     </div>

   </div>
  }

  { currentStep >= 2 && <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Personal Information</h2>
      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input type="tel" name="phone" placeholder="Phone" value={formData.phone}  onChange={(e) => {
            const value = e.target.value;
            // Only update if the length is <= 10 and contains only numbers
            if (value.length <= 10 && /^[0-9]*$/.test(value)) {
              setFormData({ ...formData, phone: value });
            }
          }} className="w-full p-2 border rounded" required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
      <div className="flex justify-between">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
      </div>
    </form>}


    {currentStep >= 3 &&  <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">OTP Verification</h2>
      <p className="text-gray-600">Enter the OTP sent to {formData.email}</p>
      <input
        type="text"
        name="otp"
        placeholder="Enter OTP"
        value={otp}
        onChange={handleOtpChange}
        className="w-full p-2 border rounded"
        required
      />
      <div className="flex justify-between">
       
        <button
          type="submit"
          onClick={handleVerifyOtp}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>}

    {currentStep >= 4 &&    <form onSubmit={handleSSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Department, Shift, Task</h2>
      <select 
  name="department" 
  value={formSData.department} 
  onChange={handleSChange} 
  className="w-full p-2 border rounded" 
  required
>
  <option value="">Select Department</option>
  {departments.map((dept, index) => (
    <option key={index} value={dept}>{dept}</option>
  ))}
</select>

<select 
  name="shift" 
  value={formSData.shift} 
  onChange={handleSChange} 
  className="w-full p-2 border rounded" 
  required
>
  <option value="">Select Shift</option>
  <option value="Day">Day</option>
  <option value="Afternoon">Afternoon</option>
  <option value="Night">Night</option>
</select>

      <input type="text" name="task" placeholder="Task" value={formData.task} onChange={handleSChange} className="w-full p-2 border rounded" required />
      <div className="flex justify-between">
 
        <button  type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </div>
    </form>}
      
   </div>
    
 </>
  );
};

export default Employee;


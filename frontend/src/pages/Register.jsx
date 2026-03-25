import React, { useState, useEffect, useRef } from "react";
import { register } from "../Services/api";
import { useNavigate, Link } from "react-router-dom";

// --- Expanded mock data for autocomplete ---
const mockData = {
  education: [
    "Bachelor of Science in Computer Science (B.Sc CS)",
    "Bachelor of Technology in Computer Science (B.Tech CS)",
    "Bachelor of Technology in Information Technology (B.Tech IT)",
    "Bachelor of Technology in Artificial Intelligence (B.Tech AI)",
    "Bachelor of Technology in Data Science (B.Tech DS)",
    "Bachelor of Technology in Machine Learning (B.Tech ML)",
    "Bachelor of Technology in Electronics & Communication (B.Tech ECE)",
    "Bachelor of Technology in Electrical Engineering (B.Tech EE)",
    "Bachelor of Technology in Mechanical Engineering (B.Tech ME)",
    "Bachelor of Technology in Civil Engineering (B.Tech CE)",
    "Bachelor of Technology in Cyber Security",
    "Bachelor of Technology in Cloud Computing",
    "Bachelor of Engineering in Computer Engineering (B.E CE)",
    "Bachelor of Engineering in Information Technology (B.E IT)",
    "Bachelor of Engineering in Electronics & Telecommunication (B.E ETC)",
    "Bachelor of Computer Applications (BCA)",
    "Bachelor of Science in Information Technology (B.Sc IT)",
    "Bachelor of Science in Mathematics",
    "Bachelor of Science in Physics",
    "Bachelor of Science in Statistics",
    "Bachelor of Commerce in Computers (B.Com CS)",
    "Master of Science in Computer Science (M.Sc CS)",
    "Master of Science in Data Science",
    "Master of Science in Software Engineering",
    "Master of Science in Artificial Intelligence",
    "Master of Technology in Computer Science (M.Tech CS)",
    "Master of Technology in Software Engineering",
    "Master of Technology in Information Security",
    "Master of Computer Applications (MCA)",
    "Master of Business Administration in IT (MBA IT)",
    "Master of Business Administration in Systems",
    "Master of Business Administration (MBA)",
    "Master of Engineering in Computer Engineering (M.E CE)",
    "Master of Engineering in VLSI Design",
    "PhD in Computer Science",
    "PhD in Artificial Intelligence",
    "PhD in Machine Learning",
    "PhD in Data Science",
    "PhD in Robotics",
    "PhD in Computational Biology",
    "PhD in Cryptography",
    "Diploma in Computer Engineering",
    "Diploma in Information Technology",
    "Diploma in Cyber Security",
    "Diploma in Web Development",
    "Associate Degree in Computer Science",
    "Post Graduate Diploma in Data Science (PGDDS)",
    "Post Graduate Diploma in Artificial Intelligence",
    "Self‑taught / Self-Learner",
    "Coding Bootcamp Graduate",
    "High School Diploma / 12th Grade",
    "Undergraduate Student (Currently Pursuing)"
  ],
  address: [
    // Maharashtra
    "Mumbai, Maharashtra, India", "Pune, Maharashtra, India", "Nagpur, Maharashtra, India", "Thane, Maharashtra, India", "Pimpri-Chinchwad, Maharashtra, India", "Nashik, Maharashtra, India", "Kalyan-Dombivli, Maharashtra, India", "Vasai-Virar, Maharashtra, India", "Sambhajinagar, Maharashtra, India", "Navi Mumbai, Maharashtra, India", "Solapur, Maharashtra, India", "Mira-Bhayandar, Maharashtra, India", "Bhiwandi, Maharashtra, India", "Amravati, Maharashtra, India", "Nanded, Maharashtra, India", "Kolhapur, Maharashtra, India", "Akola, Maharashtra, India", "Ulhasnagar, Maharashtra, India", "Sangli, Maharashtra, India", "Malegaon, Maharashtra, India", "Jalgaon, Maharashtra, India", "Latur, Maharashtra, India", "Dhule, Maharashtra, India", "Ahmednagar, Maharashtra, India", "Chandrapur, Maharashtra, India", "Parbhani, Maharashtra, India", "Ichalkaranji, Maharashtra, India", "Jalna, Maharashtra, India", "Ambernath, Maharashtra, India", "Bhusawal, Maharashtra, India", "Panvel, Maharashtra, India", "Badlapur, Maharashtra, India", "Beed, Maharashtra, India", "Gondia, Maharashtra, India", "Satara, Maharashtra, India", "Barshi, Maharashtra, India", "Yavatmal, Maharashtra, India", "Achalpur, Maharashtra, India", "Osmanabad, Maharashtra, India", "Nandurbar, Maharashtra, India", "Wardha, Maharashtra, India", "Udgir, Maharashtra, India", "Hinganghat, Maharashtra, India", "Kharghar, Maharashtra, India",
    // Delhi & NCR
    "Delhi, India", "New Delhi, Delhi, India", "Noida, Uttar Pradesh, India", "Greater Noida, Uttar Pradesh, India", "Gurugram, Haryana, India", "Faridabad, Haryana, India", "Ghaziabad, Uttar Pradesh, India",
    // Karnataka
    "Bengaluru, Karnataka, India", "Hubli-Dharwad, Karnataka, India", "Mysuru, Karnataka, India", "Kalaburagi, Karnataka, India", "Mangaluru, Karnataka, India", "Belagavi, Karnataka, India", "Davanagere, Karnataka, India", "Ballari, Karnataka, India", "Vijayapura, Karnataka, India", "Shivamogga, Karnataka, India", "Tumakuru, Karnataka, India", "Raichur, Karnataka, India", "Bidar, Karnataka, India", "Hosapete, Karnataka, India", "Gadag, Karnataka, India", "Robertson Pet, Karnataka, India", "Hassan, Karnataka, India", "Bhadravati, Karnataka, India", "Chitradurga, Karnataka, India", "Kolar, Karnataka, India", "Mandya, Karnataka, India", "Chikkamagaluru, Karnataka, India", "Udupi, Karnataka, India", "Ranebennuru, Karnataka, India",
    // Tamil Nadu
    "Chennai, Tamil Nadu, India", "Coimbatore, Tamil Nadu, India", "Madurai, Tamil Nadu, India", "Tiruchirappalli, Tamil Nadu, India", "Salem, Tamil Nadu, India", "Tirunelveli, Tamil Nadu, India", "Tiruppur, Tamil Nadu, India", "Vellore, Tamil Nadu, India", "Erode, Tamil Nadu, India", "Thoothukkudi, Tamil Nadu, India", "Dindigul, Tamil Nadu, India", "Thanjavur, Tamil Nadu, India", "Ranipet, Tamil Nadu, India", "Sivakasi, Tamil Nadu, India", "Karur, Tamil Nadu, India", "Udhagamandalam, Tamil Nadu, India", "Hosur, Tamil Nadu, India", "Nagercoil, Tamil Nadu, India", "Kanchipuram, Tamil Nadu, India", "Kumarapalayam, Tamil Nadu, India", "Karaikkudi, Tamil Nadu, India", "Neyveli, Tamil Nadu, India", "Cuddalore, Tamil Nadu, India", "Kumbakonam, Tamil Nadu, India", "Tiruvannamalai, Tamil Nadu, India", "Rajapalayam, Tamil Nadu, India",
    // Gujarat
    "Ahmedabad, Gujarat, India", "Surat, Gujarat, India", "Vadodara, Gujarat, India", "Rajkot, Gujarat, India", "Bhavnagar, Gujarat, India", "Jamnagar, Gujarat, India", "Gandhinagar, Gujarat, India", "Junagadh, Gujarat, India", "Anand, Gujarat, India", "Navsari, Gujarat, India", "Morbi, Gujarat, India", "Nadiad, Gujarat, India", "Surendranagar, Gujarat, India", "Bharuch, Gujarat, India", "Mehsana, Gujarat, India", "Bhuj, Gujarat, India", "Porbandar, Gujarat, India", "Palanpur, Gujarat, India", "Valsad, Gujarat, India", "Vapi, Gujarat, India", "Gondal, Gujarat, India", "Veraval, Gujarat, India", "Godhra, Gujarat, India", "Patan, Gujarat, India", "Dahod, Gujarat, India", "Botad, Gujarat, India", "Amreli, Gujarat, India",
    // Uttar Pradesh
    "Lucknow, Uttar Pradesh, India", "Kanpur, Uttar Pradesh, India", "Agra, Uttar Pradesh, India", "Meerut, Uttar Pradesh, India", "Varanasi, Uttar Pradesh, India", "Prayagraj, Uttar Pradesh, India", "Bareilly, Uttar Pradesh, India", "Aligarh, Uttar Pradesh, India", "Moradabad, Uttar Pradesh, India", "Saharanpur, Uttar Pradesh, India", "Gorakhpur, Uttar Pradesh, India", "Ayodhya, Uttar Pradesh, India", "Firozabad, Uttar Pradesh, India", "Jhansi, Uttar Pradesh, India", "Muzaffarnagar, Uttar Pradesh, India", "Mathura, Uttar Pradesh, India", "Budaun, Uttar Pradesh, India", "Rampur, Uttar Pradesh, India", "Shahjahanpur, Uttar Pradesh, India", "Farrukhabad, Uttar Pradesh, India", "Hapur, Uttar Pradesh, India", "Etawah, Uttar Pradesh, India", "Mirzapur, Uttar Pradesh, India", "Bulandshahr, Uttar Pradesh, India", "Sambhal, Uttar Pradesh, India", "Amroha, Uttar Pradesh, India", "Hardoi, Uttar Pradesh, India", "Fatehpur, Uttar Pradesh, India", "Raebareli, Uttar Pradesh, India", "Orai, Uttar Pradesh, India", "Sitapur, Uttar Pradesh, India", "Bahraich, Uttar Pradesh, India", "Modinagar, Uttar Pradesh, India", "Unnao, Uttar Pradesh, India", "Jaunpur, Uttar Pradesh, India", "Lakhimpur, Uttar Pradesh, India", "Hathras, Uttar Pradesh, India", "Banda, Uttar Pradesh, India", "Pilibhit, Uttar Pradesh, India", "Barabanki, Uttar Pradesh, India", "Mainpuri, Uttar Pradesh, India", "Etah, Uttar Pradesh, India", "Deoria, Uttar Pradesh, India", "Ghazipur, Uttar Pradesh, India", "Sultanpur, Uttar Pradesh, India", "Azamgarh, Uttar Pradesh, India", "Bijnor, Uttar Pradesh, India", "Basti, Uttar Pradesh, India", "Ballia, Uttar Pradesh, India",
    // West Bengal
    "Kolkata, West Bengal, India", "Asansol, West Bengal, India", "Siliguri, West Bengal, India", "Durgapur, West Bengal, India", "Bardhaman, West Bengal, India", "English Bazar, West Bengal, India", "Baharampur, West Bengal, India", "Habra, West Bengal, India", "Kharagpur, West Bengal, India", "Shantipur, West Bengal, India", "Dankuni, West Bengal, India", "Dhulian, West Bengal, India", "Ranaghat, West Bengal, India", "Haldia, West Bengal, India", "Raiganj, West Bengal, India", "Krishnanagar, West Bengal, India", "Nabadwip, West Bengal, India", "Medinipur, West Bengal, India", "Jalpaiguri, West Bengal, India", "Balurghat, West Bengal, India", "Basirhat, West Bengal, India", "Bankura, West Bengal, India", "Chakdaha, West Bengal, India", "Darjeeling, West Bengal, India", "Alipurduar, West Bengal, India", "Purulia, West Bengal, India", "Jangipur, West Bengal, India", "Bangaon, West Bengal, India", "Cooch Behar, West Bengal, India",
    // Rajasthan
    "Jaipur, Rajasthan, India", "Jodhpur, Rajasthan, India", "Kota, Rajasthan, India", "Bikaner, Rajasthan, India", "Ajmer, Rajasthan, India", "Udaipur, Rajasthan, India", "Bhilwara, Rajasthan, India", "Alwar, Rajasthan, India", "Bharatpur, Rajasthan, India", "Sikar, Rajasthan, India", "Pali, Rajasthan, India", "Sri Ganganagar, Rajasthan, India", "Kishangarh, Rajasthan, India", "Tonk, Rajasthan, India", "Hanumangarh, Rajasthan, India", "Beawar, Rajasthan, India", "Churu, Rajasthan, India", "Dholpur, Rajasthan, India", "Sawai Madhopur, Rajasthan, India", "Bundi, Rajasthan, India", "Nagaur, Rajasthan, India", "Hindaun, Rajasthan, India", "Bhiwadi, Rajasthan, India", "Rajsamand, Rajasthan, India", "Chittorgarh, Rajasthan, India",
    // Madhya Pradesh
    "Indore, Madhya Pradesh, India", "Bhopal, Madhya Pradesh, India", "Jabalpur, Madhya Pradesh, India", "Gwalior, Madhya Pradesh, India", "Ujjain, Madhya Pradesh, India", "Sagar, Madhya Pradesh, India", "Dewas, Madhya Pradesh, India", "Satna, Madhya Pradesh, India", "Ratlam, Madhya Pradesh, India", "Rewa, Madhya Pradesh, India", "Murwara, Madhya Pradesh, India", "Singrauli, Madhya Pradesh, India", "Burhanpur, Madhya Pradesh, India", "Khandwa, Madhya Pradesh, India", "Bhind, Madhya Pradesh, India", "Chhindwara, Madhya Pradesh, India", "Guna, Madhya Pradesh, India", "Shivpuri, Madhya Pradesh, India", "Vidisha, Madhya Pradesh, India", "Damoh, Madhya Pradesh, India", "Chhatarpur, Madhya Pradesh, India", "Mandsaur, Madhya Pradesh, India", "Khargone, Madhya Pradesh, India", "Neemuch, Madhya Pradesh, India", "Pithampur, Madhya Pradesh, India", "Hoshangabad, Madhya Pradesh, India",
    // Andhra Pradesh & Telangana
    "Hyderabad, Telangana, India", "Warangal, Telangana, India", "Nizamabad, Telangana, India", "Karimnagar, Telangana, India", "Ramagundam, Telangana, India", "Khammam, Telangana, India", "Mahbubnagar, Telangana, India", "Nalgonda, Telangana, India", "Adilabad, Telangana, India", "Suryapet, Telangana, India",
    "Visakhapatnam, Andhra Pradesh, India", "Vijayawada, Andhra Pradesh, India", "Guntur, Andhra Pradesh, India", "Nellore, Andhra Pradesh, India", "Kurnool, Andhra Pradesh, India", "Rajahmundry, Andhra Pradesh, India", "Kakinada, Andhra Pradesh, India", "Tirupati, Andhra Pradesh, India", "Anantapur, Andhra Pradesh, India", "Kadapa, Andhra Pradesh, India", "Vizianagaram, Andhra Pradesh, India", "Eluru, Andhra Pradesh, India", "Ongole, Andhra Pradesh, India", "Nandyal, Andhra Pradesh, India", "Machilipatnam, Andhra Pradesh, India", "Adoni, Andhra Pradesh, India", "Tenali, Andhra Pradesh, India", "Proddatur, Andhra Pradesh, India", "Chittoor, Andhra Pradesh, India", "Hindupur, Andhra Pradesh, India", "Bhimavaram, Andhra Pradesh, India", "Madanapalle, Andhra Pradesh, India", "Guntakal, Andhra Pradesh, India", "Srikakulam, Andhra Pradesh, India", "Dharmavaram, Andhra Pradesh, India",
    // Bihar
    "Patna, Bihar, India", "Gaya, Bihar, India", "Bhagalpur, Bihar, India", "Muzaffarpur, Bihar, India", "Purnia, Bihar, India", "Darbhanga, Bihar, India", "Bihar Sharif, Bihar, India", "Arrah, Bihar, India", "Begusarai, Bihar, India", "Katihar, Bihar, India", "Munger, Bihar, India", "Chhapra, Bihar, India", "Danapur, Bihar, India", "Saharsa, Bihar, India", "Hajipur, Bihar, India", "Sasaram, Bihar, India", "Dehri, Bihar, India", "Siwan, Bihar, India", "Motihari, Bihar, India", "Nawada, Bihar, India", "Bagaha, Bihar, India", "Buxar, Bihar, India", "Kishanganj, Bihar, India", "Sitamarhi, Bihar, India", "Jamui, Bihar, India",
    // Punjab & Haryana
    "Ludhiana, Punjab, India", "Amritsar, Punjab, India", "Jalandhar, Punjab, India", "Patiala, Punjab, India", "Bathinda, Punjab, India", "Ajitgarh, Punjab, India", "Hoshiarpur, Punjab, India", "Batala, Punjab, India", "Pathankot, Punjab, India", "Moga, Punjab, India", "Abohar, Punjab, India", "Malerkotla, Punjab, India", "Khanna, Punjab, India", "Phagwara, Punjab, India", "Muktsar, Punjab, India", "Barnala, Punjab, India", "Rajpura, Punjab, India", "Firozpur, Punjab, India",
    "Rohtak, Haryana, India", "Panipat, Haryana, India", "Karnal, Haryana, India", "Sonipat, Haryana, India", "Yamunanagar, Haryana, India", "Panchkula, Haryana, India", "Bhiwani, Haryana, India", "Ambala, Haryana, India", "Sirsa, Haryana, India", "Hisar, Haryana, India", "Jind, Haryana, India", "Thanesar, Haryana, India", "Kaithal, Haryana, India", "Rewari, Haryana, India", "Palwal, Haryana, India",
    // Kerala
    "Thiruvananthapuram, Kerala, India", "Kochi, Kerala, India", "Kozhikode, Kerala, India", "Kollam, Kerala, India", "Thrissur, Kerala, India", "Alappuzha, Kerala, India", "Palakkad, Kerala, India", "Malappuram, Kerala, India", "Manjeri, Kerala, India", "Thalassery, Kerala, India", "Ponnani, Kerala, India", "Vatakara, Kerala, India", "Kanhangad, Kerala, India", "Kottayam, Kerala, India", "Payyanur, Kerala, India",
    // Odisha
    "Bhubaneswar, Odisha, India", "Cuttack, Odisha, India", "Raurkela, Odisha, India", "Brahmapur, Odisha, India", "Sambalpur, Odisha, India", "Puri, Odisha, India", "Baleshwar, Odisha, India", "Bhadrak, Odisha, India", "Baripada, Odisha, India", "Jharsuguda, Odisha, India", "Bargarh, Odisha, India", "Rayagada, Odisha, India", "Bhawanipatna, Odisha, India",
    // Jharkhand & Chhattisgarh
    "Ranchi, Jharkhand, India", "Jamshedpur, Jharkhand, India", "Dhanbad, Jharkhand, India", "Bokaro Steel City, Jharkhand, India", "Deoghar, Jharkhand, India", "Phusro, Jharkhand, India", "Hazaribagh, Jharkhand, India", "Giridih, Jharkhand, India", "Ramgarh, Jharkhand, India", "Medininagar, Jharkhand, India", "Chirkunda, Jharkhand, India",
    "Raipur, Chhattisgarh, India", "Bhilai, Chhattisgarh, India", "Bilaspur, Chhattisgarh, India", "Korba, Chhattisgarh, India", "Rajnandgaon, Chhattisgarh, India", "Raigarh, Chhattisgarh, India", "Jagdalpur, Chhattisgarh, India", "Ambikapur, Chhattisgarh, India", "Chirmiri, Chhattisgarh, India", "Mahasamund, Chhattisgarh, India", "Dhamtari, Chhattisgarh, India",
    // Assam, Uttarakhand, Others
    "Guwahati, Assam, India", "Silchar, Assam, India", "Dibrugarh, Assam, India", "Jorhat, Assam, India", "Nagaon, Assam, India", "Tinsukia, Assam, India", "Tezpur, Assam, India",
    "Dehradun, Uttarakhand, India", "Haridwar, Uttarakhand, India", "Roorkee, Uttarakhand, India", "Haldwani, Uttarakhand, India", "Rudrapur, Uttarakhand, India", "Kashipur, Uttarakhand, India", "Rishikesh, Uttarakhand, India",
    "Srinagar, Jammu and Kashmir, India", "Jammu, Jammu and Kashmir, India", "Anantnag, Jammu and Kashmir, India",
    "Chandigarh, India", "Puducherry, India", "Agartala, Tripura, India", "Imphal, Manipur, India", "Aizawl, Mizoram, India", "Shillong, Meghalaya, India", "Kohima, Meghalaya, India", "Gangtok, Sikkim, India", "Port Blair, Puducherry, India", "Panaji, Goa, India"
  ],
  skills: [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go (Golang)", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala", "Perl", "Haskell", "R", "MATLAB",
    "React", "React Native", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "Ember.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Sass", "Material UI", "Chakra UI",
    "Node.js", "Express.js", "NestJS", "Spring Boot", "Django", "Flask", "FastAPI", "Laravel", "Symfony", "Ruby on Rails", "ASP.NET Core", "GraphQL", "RESTful APIs", "gRPC", "WebSockets",
    "SQL", "PostgreSQL", "MySQL", "Oracle DB", "Microsoft SQL Server", "NoSQL", "MongoDB", "Cassandra", "DynamoDB", "Couchbase", "Redis", "Memcached", "Elasticsearch", "Firebase", "Supabase",
    "Machine Learning", "Deep Learning", "Data Analysis", "Natural Language Processing (NLP)", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Keras", "OpenCV", "Hugging Face", "LLMs", "Generative AI",
    "AWS", "Amazon EC2", "AWS Lambda", "Amazon S3", "Google Cloud (GCP)", "Microsoft Azure", "DigitalOcean", "Heroku", "Vercel", "Netlify",
    "Docker", "Kubernetes", "Jenkins", "GitLab CI/CD", "GitHub Actions", "Travis CI", "Terraform", "Ansible", "Puppet", "Chef", "Prometheus", "Grafana",
    "Git", "GitHub", "GitLab", "Bitbucket", "Linux", "Bash Scripting", "Powershell", "Agile Methodologies", "Scrum", "Jira", "Trello",
    "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Framer", "Wireframing", "Prototyping",
    "Data Structures", "Algorithms", "System Design", "Microservices Architecture", "Event-Driven Architecture", "Kafka", "RabbitMQ", "ActiveMQ",
    "Web3", "Blockchain", "Solidity", "Smart Contracts", "Ethereum", "Game Development", "Unity", "Unreal Engine", "C"
  ],
  company_interest: [
    // MNCs & Big Tech
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "OpenAI", "Anthropic", "Tesla", "SpaceX", "Stripe", "Airbnb", "Uber", "Lyft", "Spotify", "Pinterest", "Snap", "TikTok", "Databricks", "Snowflake", "Palantir", "Atlassian", "Salesforce", "Adobe", "Oracle", "IBM", "Cisco", "Intel", "NVIDIA", "AMD", "SAP", "VMware", "Intuit", "ServiceNow", "Plaid", "Dropbox", "Coinbase", "Robinhood", "LinkedIn", "Twitter", "Zoom", "Square", "Twilio", "Roku", "Discord", "GitHub", "GitLab", "HashiCorp", "Cloudflare",
    // Indian IT Giants
    "TCS (Tata Consultancy Services)", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra", "L&T Technology Services", "Cognizant", "Mindtree", "Mphasis", "Hexaware", "Persistent Systems", "Zensar Technologies", "Coforge", "Birlasoft", "KPIT Technologies",
    // Indian Product Companies, Unicorns & Startups
    "Zoho", "Freshworks", "Postman", "BrowserStack", "Chargebee", "Druva", "Innovaccer", "Zenoti", "Icertis", "Flipkart", "Paytm", "Ola", "Swiggy", "Zomato", "CRED", "Razorpay", "Zerodha", "Dream11", "Meesho", "Pine Labs", "Unacademy", "Byju's", "OYO", "MakeMyTrip", "PolicyBazaar", "Nykaa", "Udaan", "ShareChat", "Groww", "Upstox", "BharatPe", "Lenskart", "Delhivery", "Cars24", "Pharmeasy", "Digit Insurance", "Acko", "Urban Company", "Zetwerk", "MobiKwik", "Licious", "Blinkit", "InMobi", "GlobalLogic",
    // Top Finance/Banking tech (India presence)
    "Goldman Sachs", "JPMorgan Chase", "Morgan Stanley", "Wells Fargo", "Citi", "Bank of America", "Barclays", "Standard Chartered", "Fidelity", "American Express", "Mastercard", "Visa",
    // Top Consulting/Services
    "Accenture", "Deloitte", "Capgemini", "PwC", "EY", "KPMG", "McKinsey", "BCG", "Bain & Company"
  ],
};

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    education: "",
    address: "",
    skills: "",
    company_interest: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const nav = useNavigate();

  // --- Autocomplete states ---
  const [suggestions, setSuggestions] = useState({
    education: [],
    address: [],
    skills: [],
    company_interest: [],
  });
  const [showSuggestions, setShowSuggestions] = useState({
    education: false,
    address: false,
    skills: false,
    company_interest: false,
  });
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState({
    education: -1,
    address: -1,
    skills: -1,
    company_interest: -1,
  });

  // Refs for dropdown containers
  const suggestionRefs = {
    education: useRef(null),
    address: useRef(null),
    skills: useRef(null),
    company_interest: useRef(null),
  };

  // --- Automatic Location Fetching via CDN (IP based) ---
  useEffect(() => {
    const fetchLocation = async () => {
      setLocating(true);
      try {
        // Free CDN for IP geolocation (No API key required)
        const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await response.json();
        
        if (data && data.city) {
          // Formats as "City, Region" (e.g., "Pune, Maharashtra")
          const formattedLocation = `${data.city}, ${data.region}`;
          setForm((prev) => ({ ...prev, address: formattedLocation }));
        }
      } catch (error) {
        console.error("Error fetching location from CDN:", error);
      } finally {
        setLocating(false);
      }
    };

    fetchLocation();
  }, []);

  // --- Helper to filter suggestions ---
  const getFilteredSuggestions = (field, query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return mockData[field].filter((item) =>
      item.toLowerCase().includes(lowerQuery)
    );
  };

  // --- Update suggestions on input change ---
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const filtered = getFilteredSuggestions(field, value);
    setSuggestions((prev) => ({ ...prev, [field]: filtered }));
    setShowSuggestions((prev) => ({ ...prev, [field]: filtered.length > 0 }));
    setActiveSuggestionIndex((prev) => ({ ...prev, [field]: -1 }));
  };

  // --- Select a suggestion ---
  const selectSuggestion = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setShowSuggestions((prev) => ({ ...prev, [field]: false }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
  };

  // --- Keyboard navigation ---
  const handleKeyDown = (e, field) => {
    if (!showSuggestions[field]) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => ({
        ...prev,
        [field]: Math.min(prev[field] + 1, suggestions[field].length - 1),
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => ({
        ...prev,
        [field]: Math.max(prev[field] - 1, -1),
      }));
    } else if (e.key === "Enter" && activeSuggestionIndex[field] >= 0) {
      e.preventDefault();
      const selected = suggestions[field][activeSuggestionIndex[field]];
      if (selected) selectSuggestion(field, selected);
    } else if (e.key === "Escape") {
      setShowSuggestions((prev) => ({ ...prev, [field]: false }));
    }
  };

  // --- Click outside to close dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(suggestionRefs).forEach((field) => {
        if (
          suggestionRefs[field].current &&
          !suggestionRefs[field].current.contains(event.target)
        ) {
          setShowSuggestions((prev) => ({ ...prev, [field]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Back button trap ---
  useEffect(() => {
    window.history.pushState({ isRegister: true }, null, window.location.href);
    const handlePopState = () => {
      nav("/", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [nav]);

  // --- Submit handler ---
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await register(form);
      setMsg("Account created! Redirecting to login...");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (err) {
      setMsg("Error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  }

  // --- Render Function: Autocomplete Field ---
  const renderAutocompleteField = ({ label, field, placeholder, required = false, span2 = false }) => (
    <div className={span2 ? "col-span-1 sm:col-span-2" : "col-span-1"} key={field}>
      <label className="block text-[0.65rem] sm:text-xs font-bold text-[#8C9CA8] uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative" ref={suggestionRefs[field]}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {field === "education" && (
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            )}
            {field === "address" && (
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {field === "skills" && (
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            )}
            {field === "company_interest" && (
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.049-.394.094-.594.139-.49.11-.99.21-1.495.296m-6.75 0a45.653 45.653 0 00-6.006-.258c-1.45.074-2.89.18-4.324.318-1.068.104-1.86 1.038-1.86 2.119v1.043c0 1.018.766 1.88 1.753 2.044a42.032 42.032 0 003.866.334m-4.5-7.994c-.194.049-.394.094-.594.139-.49.11-.99.21-1.495.296m6.75 0c.207.004.414.007.621.01.57.006 1.141.01 1.714.01m-4.5 0c-.207.004-.414.007-.621.01-.57.006-1.141.01-1.714.01m0-6.75c0-1.011.436-1.971 1.2-2.62a3.75 3.75 0 014.8 0c.764.649 1.2 1.609 1.2 2.62m0 0c0 1.011-.436 1.971-1.2 2.62a3.75 3.75 0 01-4.8 0c-.764-.649-1.2-1.609-1.2-2.62m0 0h7.5" />
              </svg>
            )}
          </div>
          <input
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={form[field]}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, field)}
            onFocus={() => {
              const filtered = getFilteredSuggestions(field, form[field]);
              setSuggestions((prev) => ({ ...prev, [field]: filtered }));
              setShowSuggestions((prev) => ({ ...prev, [field]: filtered.length > 0 }));
            }}
            required={required}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-[#F9FBFC] border border-[#E5E0D8] rounded-xl sm:rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:shadow-sm transition-all text-[#0B202E] text-sm font-semibold placeholder:text-[#8C9CA8]/60"
          />
          {/* Loading Indicator for CDN API */}
          {field === "address" && locating && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="animate-spin h-4 w-4 text-amber-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
        </div>
        {showSuggestions[field] && suggestions[field].length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto py-1">
            {suggestions[field].map((item, idx) => (
              <li
                key={idx}
                onClick={() => selectSuggestion(field, item)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 cursor-pointer hover:bg-amber-50 text-sm transition-colors ${
                  idx === activeSuggestionIndex[field] ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700"
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // --- Render Function: Regular Field ---
  const renderRegularField = ({ label, field, type = "text", placeholder, required = false, span2 = false }) => (
    <div className={span2 ? "col-span-1 sm:col-span-2" : "col-span-1"} key={field}>
      <label className="block text-[0.65rem] sm:text-xs font-bold text-[#8C9CA8] uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {field === "name" && (
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {field === "email" && (
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          )}
          {field === "password" && (
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={form[field]}
          onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
          required={required}
          className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-[#F9FBFC] border border-[#E5E0D8] rounded-xl sm:rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:shadow-sm transition-all text-[#0B202E] text-sm font-semibold placeholder:text-[#8C9CA8]/60"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#ffffff] relative overflow-hidden">
      {/* Background Decor */}
      <style>{`
        .wave-bg {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; opacity: 0.12;
          background-repeat: repeat; background-size: 200px 40px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath fill='none' stroke='%233168FF' stroke-width='1.5' d='M0,20 C25,5 75,35 100,20 C125,5 175,35 200,20' /%3E%3C/svg%3E");
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .btn-shimmer { position: relative; overflow: hidden; }
        .btn-shimmer::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent);
          animation: shimmer 2.5s infinite;
        }
      `}</style>
      <div className="wave-bg" />

      <div className="w-full max-w-[600px] animate-slide-up relative z-10 my-8 sm:my-12">
        {/* Form Container */}
        <div
          className="relative p-5 sm:p-8 bg-[#ffffff] rounded-2xl sm:rounded-[2rem] transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100"
        >
          {/* Back Arrow INSIDE the Card */}
          <Link
            to="/"
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 sm:p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95 border border-gray-200"
            aria-label="Back to home"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pt-6 sm:pt-4">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                boxShadow: "0 8px 24px rgba(245,158,11,0.25)",
              }}
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B202E] tracking-tight">
              Create your account
            </h2>
            <p className="text-[0.8rem] sm:text-sm text-[#405869] mt-1.5 font-medium">
              Join 50,000+ engineers mastering their interviews
            </p>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {renderRegularField({ label: "Full Name", field: "name", placeholder: "e.g., John Doe", required: true, span2: true })}
            {renderRegularField({ label: "Email", field: "email", type: "email", placeholder: "you@example.com", required: true, span2: true })}
            {renderRegularField({ label: "Password", field: "password", type: "password", placeholder: "••••••••", required: true, span2: true })}
            
            {renderAutocompleteField({ label: "Education", field: "education", placeholder: "e.g., B.Sc in CS" })}
            {renderAutocompleteField({ label: "Location", field: "address", placeholder: locating ? "Auto-detecting..." : "e.g., Pune, Maharashtra" })}

            {renderAutocompleteField({ label: "Core Skills", field: "skills", placeholder: "React, Python...", span2: true })}
            {renderAutocompleteField({ label: "Target Companies", field: "company_interest", placeholder: "Google, Meta...", span2: true })}

            {msg && (
              <div
                className={`col-span-1 sm:col-span-2 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in ${
                  msg.startsWith("Error") ? "bg-red-50 border border-red-100 text-red-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={msg.startsWith("Error") ? "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" : "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"} clipRule="evenodd" />
                </svg>
                {msg}
              </div>
            )}

            <div className="col-span-1 sm:col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-shimmer w-full py-3 sm:py-3.5 text-sm sm:text-[0.95rem] font-extrabold text-white rounded-xl sm:rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 0 12px rgba(245,158,11,0.5), 0 6px 16px rgba(245,158,11,0.15)",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-[0.85rem] text-[#405869] font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-bold transition-colors ml-1" style={{ color: "#F59E0B" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, MessageCircle, Users, ArrowLeft, Moon, Sun, Send, Lock, Camera, Settings, User, Image, Video, Smile, Paperclip, Home } from 'lucide-react';

const CheckInApp = () => {
const [currentView, setCurrentView] = useState('landing');
const [authMode, setAuthMode] = useState('signup');
const [userGender, setUserGender] = useState(null);
const [checkedInVenue, setCheckedInVenue] = useState(null);
const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
const [matches, setMatches] = useState([]);
const [touchStart, setTouchStart] = useState(0);
const [touchEnd, setTouchEnd] = useState(0);
const [swipeDirection, setSwipeDirection] = useState(null);
const [darkMode, setDarkMode] = useState(true);
const [distanceUnit, setDistanceUnit] = useState('km');
const [venueFilter, setVenueFilter] = useState('distance');
const [checkInFilter, setCheckInFilter] = useState('radius');
const [isPremium, setIsPremium] = useState(false);
const [swipesRemaining, setSwipesRemaining] = useState(5);
const [lastSwipeReset, setLastSwipeReset] = useState(Date.now());
const [isVerified, setIsVerified] = useState(false);
const [checkedInVenueId, setCheckedInVenueId] = useState(null);
const [lastCheckInTime, setLastCheckInTime] = useState(null);
const [isIncognito, setIsIncognito] = useState(false);
const [blockedUsers, setBlockedUsers] = useState([]);
const [activeChat, setActiveChat] = useState(null);
const [messages, setMessages] = useState({});
const [messageInput, setMessageInput] = useState('');
const [faceAuthEnabled, setFaceAuthEnabled] = useState(false);
const [isTyping, setIsTyping] = useState(false);
const [userLocation, setUserLocation] = useState(null);
const [showAttachMenu, setShowAttachMenu] = useState(false);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [suggestedInterests, setSuggestedInterests] = useState([]);
const [showIncognitoModal, setShowIncognitoModal] = useState(false);
const [pendingCheckInVenue, setPendingCheckInVenue] = useState(null);
const [showBlockModal, setShowBlockModal] = useState(false);
const [userToBlock, setUserToBlock] = useState(null);
const [likedProfiles, setLikedProfiles] = useState([]);
const messagesEndRef = useRef(null);
const fileInputRef = useRef(null);
const attachInputRef = useRef(null);
const cameraInputRef = useRef(null);

const [credentials, setCredentials] = useState({
username: '',
password: '',
email: ''
});

useEffect(() => {
const style = document.createElement('style');
style.textContent = `input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; height: 6px; } input[type="range"]::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; border: 1px solid #fff; } input[type="range"]::-moz-range-track { height: 6px; border-radius: 3px; border: 1px solid #fff; background: #000; } input[type="range"]::-moz-range-progress { height: 6px; border-radius: 3px; background: #fff; } input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #000; cursor: pointer; border: 2px solid #fff; margin-top: -7px; } input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #000; cursor: pointer; border: 2px solid #fff; }`;
document.head.appendChild(style);
return () => document.head.removeChild(style);
}, []);

const [userProfile, setUserProfile] = useState({
name: '',
age: 25,
bio: '',
interests: [],
image: null,
minAge: 18,
maxAge: 99,
licenseVerified: false
});

const availableInterests = [
'Art', 'Coffee', 'Travel', 'Hiking', 'Cooking', 'Music',
'Tech', 'Fitness', 'Reading', 'Photography', 'Gaming',
'Movies', 'Dancing', 'Yoga', 'Food', 'Wine'
];

const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '😍', '💯', '✨', '🙌'];

const [venues, setVenues] = useState([]);

const profiles = [
{ id: 1, name: "Alex", age: 28, bio: "Coffee lover", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80", interests: ["Art", "Coffee"], unreadMessages: 0 },
{ id: 2, name: "Jordan", age: 26, bio: "Adventure seeker", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80", interests: ["Travel"], unreadMessages: 0 },
{ id: 3, name: "Sam", age: 30, bio: "Food enthusiast", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80", interests: ["Cooking"], unreadMessages: 0 }
];

useEffect(() => {
getUserLocation();
}, []);

useEffect(() => {
if (!isPremium) {
const checkSwipeReset = setInterval(() => {
const hoursSinceReset = (Date.now() - lastSwipeReset) / (1000 * 60 * 60);
if (hoursSinceReset >= 1) {
setSwipesRemaining(5);
setLastSwipeReset(Date.now());
}
}, 60000);

return () => clearInterval(checkSwipeReset);
}
}, [isPremium, lastSwipeReset]);

useEffect(() => {
if (!isPremium) {
const deleteOldMessages = setInterval(() => {
const oneHourAgo = Date.now() - (60 * 60 * 1000);
setMessages(prev => {
const updated = { ...prev };
Object.keys(updated).forEach(chatId => {
updated[chatId] = updated[chatId].filter(msg =>
new Date(msg.timestamp).getTime() > oneHourAgo
);
});
return updated;
});
}, 60000);

return () => clearInterval(deleteOldMessages);
}
}, [isPremium]);

useEffect(() => {
if (userProfile.bio) {
const bio = userProfile.bio.toLowerCase();
const suggestions = [];
if (bio.includes('coffee')) suggestions.push('Coffee');
if (bio.includes('travel')) suggestions.push('Travel');
if (bio.includes('music')) suggestions.push('Music');
setSuggestedInterests(suggestions.slice(0, 3));
}
}, [userProfile.bio]);

const getUserLocation = () => {
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(
(position) => {
const location = { lat: position.coords.latitude, lng: position.coords.longitude };
setUserLocation(location);
generateNearbyVenues(location);
},
() => {
const defaultLocation = { lat: -34.9285, lng: 138.6007 };
setUserLocation(defaultLocation);
generateNearbyVenues(defaultLocation);
}
);
}
};

const generateNearbyVenues = (location) => {
const venueTypes = [
{ type: "Café", names: ["Espresso Bar", "Coffee Culture"] },
{ type: "Bar", names: ["Sunset Lounge", "Night Owl"] },
{ type: "Park", names: ["Central Park", "City Square"] }
];

const generatedVenues = venueTypes.map((category, idx) => ({
id: idx + 1,
name: category.names[Math.floor(Math.random() * category.names.length)],
type: category.type,
users: Math.floor(Math.random() * 15) + 5,
distance: parseFloat((Math.random() * 2 + 0.1).toFixed(1))
}));

setVenues(generatedVenues.sort((a, b) => a.distance - b.distance));
};

const handleSignup = () => {
if (credentials.username && credentials.password && credentials.email) {
setCurrentView('createProfile');
}
};

const handleLogin = () => {
if (credentials.username && credentials.password) {
setCurrentView('home');
}
};

const handleTouchStart = (e) => {
setTouchStart(e.targetTouches[0].clientY);
};

const handleTouchMove = (e) => {
setTouchEnd(e.targetTouches[0].clientY);
};

const handleTouchEnd = () => {
if (touchStart - touchEnd > 50) {
handleSwipeUp();
}
setTouchStart(0);
setTouchEnd(0);
};

const handleSwipeUp = () => {
setSwipeDirection('up');
setTimeout(() => {
if (currentProfileIndex < profiles.length - 1) {
setCurrentProfileIndex(currentProfileIndex + 1);
} else {
setCurrentProfileIndex(0);
}
setSwipeDirection(null);
}, 300);
};

const handleConnect = () => {
if (!isPremium && swipesRemaining <= 0) {
alert('You\'ve reached your swipe limit! Upgrade to Premium for unlimited swipes.');
return;
}

const newMatch = profiles[currentProfileIndex];

if (blockedUsers.includes(newMatch.id)) {
if (currentProfileIndex < profiles.length - 1) {
setCurrentProfileIndex(currentProfileIndex + 1);
} else {
setCurrentProfileIndex(0);
}
return;
}

setLikedProfiles(prev => [...prev, newMatch.id]);
setMatches([...matches, { ...newMatch, unreadMessages: 0 }]);

if (!isPremium) {
setSwipesRemaining(prev => prev - 1);
}

if (!messages[newMatch.id]) {
setMessages({
...messages,
[newMatch.id]: [{
id: Date.now(),
text: `You matched with ${newMatch.name}!`,
sender: 'system',
timestamp: new Date().toISOString()
}]
});
}

setTimeout(() => {
setMessages(prev => ({
...prev,
[newMatch.id]: [
...(prev[newMatch.id] || []),
{
id: Date.now(),
text: `Hey! Nice to match with you 😊`,
sender: 'other',
timestamp: new Date().toISOString()
}
]
}));
  
setMatches(prev => prev.map(m => 
m.id === newMatch.id 
? { ...m, unreadMessages: (m.unreadMessages || 0) + 1 }
: m
));
}, 3000);

if (currentProfileIndex < profiles.length - 1) {
setCurrentProfileIndex(currentProfileIndex + 1);
} else {
setCurrentProfileIndex(0);
}
};

const openChat = (matchId) => {
setActiveChat(matchId);
setCurrentView('chat');
setMatches(prev => prev.map(m =>
m.id === matchId
? { ...m, unreadMessages: 0 }
: m
));
};

const sendMessage = () => {
if (!messageInput.trim()) return;

const chatMessages = messages[activeChat] || [];
const hasReceivedMessage = chatMessages.some(msg => msg.sender === 'other');

if (userGender === 'female' || hasReceivedMessage) {
const newMessage = {
id: Date.now(),
text: messageInput,
sender: 'me',
timestamp: new Date().toISOString(),
status: 'delivered'
};

setMessages({
...messages,
[activeChat]: [...(messages[activeChat] || []), newMessage]
});
setMessageInput('');

setTimeout(() => {
setMessages(prev => ({
...prev,
[activeChat]: (prev[activeChat] || []).map(msg => 
msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
)
}));
}, 2000);

setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

setIsTyping(true);
setTimeout(() => {
const responses = [
"That's interesting! Tell me more 😊",
"Haha, I love that! 😄",
"Really? That's so cool!",
"I'd love to do that sometime!",
"You seem really fun 😊"
];
    
const replyMessage = {
id: Date.now(),
text: responses[Math.floor(Math.random() * responses.length)],
sender: 'other',
timestamp: new Date().toISOString()
};

setMessages(prev => ({
...prev,
[activeChat]: [...(prev[activeChat] || []), replyMessage]
}));
setIsTyping(false);
setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
}, 2000);
}
};

const handleImageUpload = (e) => {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onloadend = () => {
setUserProfile({ ...userProfile, image: reader.result });
};
reader.readAsDataURL(file);
}
};

const handleAttachmentUpload = (e) => {
const file = e.target.files[0];
const chatMessages = messages[activeChat] || [];
const hasReceivedMessage = chatMessages.some(msg => msg.sender === 'other');

if (file && (userGender === 'female' || hasReceivedMessage)) {
const reader = new FileReader();
reader.onloadend = () => {
const fileType = file.type.startsWith('image/') ? 'image' : 
file.type.startsWith('video/') ? 'video' : 'file';
    
const newMessage = {
id: Date.now(),
type: fileType,
url: reader.result,
sender: 'me',
timestamp: new Date().toISOString()
};

setMessages({
...messages,
[activeChat]: [...(messages[activeChat] || []), newMessage]
});
    
setShowAttachMenu(false);
setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
};
reader.readAsDataURL(file);
}
};

const sendGif = () => {
const chatMessages = messages[activeChat] || [];
const hasReceivedMessage = chatMessages.some(msg => msg.sender === 'other');

if (userGender === 'female' || hasReceivedMessage) {
const gifs = [
'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
'https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif'
];
  
const newMessage = {
id: Date.now(),
type: 'gif',
url: gifs[Math.floor(Math.random() * gifs.length)],
sender: 'me',
timestamp: new Date().toISOString()
};

setMessages({
...messages,
[activeChat]: [...(messages[activeChat] || []), newMessage]
});
  
setShowAttachMenu(false);
setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
}
};

const addEmoji = (emoji) => {
setMessageInput(messageInput + emoji);
};

const completeProfile = () => {
if (userProfile.name && userProfile.bio && userProfile.image && userProfile.interests.length > 0) {
setCurrentView('home');
}
};

const toggleInterest = (interest) => {
setUserProfile({
...userProfile,
interests: userProfile.interests.includes(interest)
? userProfile.interests.filter(i => i !== interest)
: [...userProfile.interests, interest]
});
};

const checkIn = (venue) => {
if (checkedInVenueId) {
alert('You are already checked in at another venue. Check out first.');
return;
}

if (!isPremium && lastCheckInTime) {
const hoursSinceLastCheckIn = (Date.now() - lastCheckInTime) / (1000 * 60 * 60);
if (hoursSinceLastCheckIn < 1) {
const minutesRemaining = Math.ceil((1 - hoursSinceLastCheckIn) * 60);
alert(`Free users can only check in once per hour. Try again in ${minutesRemaining} minutes, or upgrade to Premium for unlimited check-ins!`);
return;
}
}

if (isPremium) {
setPendingCheckInVenue(venue);
setShowIncognitoModal(true);
} else {
setCheckedInVenueId(venue.id);
setCheckedInVenue(venue);
setLastCheckInTime(Date.now());
setIsIncognito(false);
setCurrentView('discover');
}
};

const confirmCheckIn = (useIncognito) => {
if (pendingCheckInVenue) {
setCheckedInVenueId(pendingCheckInVenue.id);
setCheckedInVenue(pendingCheckInVenue);
setLastCheckInTime(Date.now());
setIsIncognito(useIncognito);
setCurrentView('discover');
setShowIncognitoModal(false);
setPendingCheckInVenue(null);
}
};

const checkOut = () => {
setCheckedInVenueId(null);
setCheckedInVenue(null);
setIsIncognito(false);
setCurrentView('home');
};

const blockUser = (userId) => {
console.log('blockUser called with userId:', userId);
console.log('isPremium:', isPremium);

// Check if user is premium
if (!isPremium) {
alert('Block feature is only available for Premium users. Upgrade to Premium to block users.');
return;
}

const userToBlockDetails = matches.find(m => m.id === userId);
const userName = userToBlockDetails?.name || 'this user';

console.log('Found user to block:', userName);

// Direct confirm call - no try/catch, no extra variables
if (confirm(`Are you sure you want to block ${userName}? They will no longer appear in your matches at any venue.`)) {
console.log('User confirmed block');
setBlockedUsers([...blockedUsers, userId]);
setMatches(matches.filter(match => match.id !== userId));
if (activeChat === userId) {
setActiveChat(null);
setCurrentView('matches');
}
alert(`${userName} has been blocked.`);
} else {
console.log('User canceled block');
}
};

const confirmBlockUser = () => {
if (userToBlock) {
setBlockedUsers([...blockedUsers, userToBlock]);
setMatches(matches.filter(match => match.id !== userToBlock));
if (activeChat === userToBlock) {
setActiveChat(null);
setCurrentView('matches');
}
setShowBlockModal(false);
setUserToBlock(null);
}
};

const cancelBlockUser = () => {
setShowBlockModal(false);
setUserToBlock(null);
};

// LANDING
if (currentView === 'landing') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center p-4 relative`}>
<button
onClick={() => setDarkMode(!darkMode)}
className={`absolute top-6 right-6 p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'} hover:scale-105 transition-transform`}
>
{darkMode ? <Sun size={24} /> : <Moon size={24} />}
</button>
<div className="text-center">
<Heart className={`w-20 h-20 ${darkMode ? 'text-white' : 'text-black'} mx-auto mb-6 animate-pulse`} />
<h1 className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-4`}>CheckIn</h1>
<p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>Meet people at your favorite places</p>
<button onClick={() => setCurrentView('auth')} className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg`}>
Get Started
</button>
</div>
</div>
);
}

// AUTH
if (currentView === 'auth') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center p-4`}>
<div className="w-full max-w-md">
<div className="text-center mb-8">
<Heart className={`w-16 h-16 ${darkMode ? 'text-white' : 'text-black'} mx-auto mb-4 animate-pulse`} />
<h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
</div>

<div className={`${darkMode ? 'bg-black border-white' : 'bg-white border-black'} border-2 rounded-3xl p-8 shadow-2xl`}>
{authMode === 'signup' && (
<div className="mb-6">
<button
onClick={() => {
setCurrentView('createProfile');
}}
className={`w-full ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2`}
>
<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
</svg>
Sign up with Apple
</button>
            
<div className="relative my-6">
<div className="absolute inset-0 flex items-center">
<div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
</div>
<div className="relative flex justify-center text-sm">
<span className={`px-4 ${darkMode ? 'bg-black text-gray-400' : 'bg-white text-gray-600'}`}>Or sign up with email</span>
</div>
</div>
</div>
)}

<div className="space-y-4">
{authMode === 'signup' && (
<input
type="email"
placeholder="Email"
value={credentials.email}
onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${darkMode ? 'bg-black text-white border-white placeholder-gray-500' : 'bg-white text-black border-black placeholder-gray-400'}`}
/>
)}
<input
type="text"
placeholder="Username"
value={credentials.username}
onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${darkMode ? 'bg-black text-white border-white placeholder-gray-500' : 'bg-white text-black border-black placeholder-gray-400'}`}
/>
<input
type="password"
placeholder="Password"
value={credentials.password}
onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none ${darkMode ? 'bg-black text-white border-white placeholder-gray-500' : 'bg-white text-black border-black placeholder-gray-400'}`}
/>
          
<button
onClick={authMode === 'signup' ? handleSignup : handleLogin}
className={`w-full ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 rounded-xl font-bold transition-colors`}
>
{authMode === 'signup' ? 'Sign Up' : 'Login'}
</button>

<div className="text-center mt-4">
<button
onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
>
{authMode === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
</button>
</div>
</div>
</div>
</div>
</div>
);
}

// CREATE PROFILE
if (currentView === 'createProfile') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} p-4`}>
<div className="max-w-md mx-auto">
<div className="flex items-center justify-between mb-4">
<button onClick={() => setCurrentView('auth')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<ArrowLeft size={24} />
</button>
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Profile</h2>
<div className="w-10"></div>
</div>

<div className="space-y-4">
{/* Profile Image */}
<div className="flex justify-center">
<div className="relative">
{userProfile.image ? (
<img src={userProfile.image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
) : (
<div className={`w-24 h-24 rounded-full flex items-center justify-center ${darkMode ? 'bg-black border-2 border-white' : 'bg-gray-200 border-2 border-black'}`}>
<Camera size={32} className={darkMode ? 'text-white' : 'text-gray-400'} />
</div>
)}
<button onClick={() => fileInputRef.current.click()} className={`absolute bottom-0 right-0 p-1.5 rounded-full ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
<Camera size={16} />
</button>
<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
</div>
</div>

{/* Main Profile Info */}
<div className={`rounded-2xl p-4 ${darkMode ? 'bg-black border-2 border-white' : 'bg-white shadow border-2 border-black'}`}>
<label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Gender</label>
<div className="grid grid-cols-2 gap-2 mb-3">
<button onClick={() => setUserGender('female')} className={`py-2 rounded-lg font-medium text-sm transition-all ${userGender === 'female' ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')}`}>
Female
</button>
<button onClick={() => setUserGender('male')} className={`py-2 rounded-lg font-medium text-sm transition-all ${userGender === 'male' ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')}`}>
Male
</button>
</div>

<input
type="text"
placeholder="Name"
value={userProfile.name}
onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
className={`w-full px-4 py-2 rounded-lg mb-3 focus:outline-none ${darkMode ? 'bg-black text-white border border-white placeholder-gray-600' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
/>

<div className="mb-3">
<label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Age: {userProfile.age}</label>
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.age - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.age - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.age}
onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) })}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
</div>

<textarea
placeholder="Bio"
value={userProfile.bio}
onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
className={`w-full px-4 py-2 rounded-lg mb-3 h-16 focus:outline-none resize-none ${darkMode ? 'bg-black text-white border border-white placeholder-gray-600' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
/>

<div className="mb-3">
<label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
Interested in ages: {userProfile.minAge} - {userProfile.maxAge}
</label>
<div className="space-y-2">
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.minAge - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.minAge - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.minAge}
onChange={(e) => {
const newMin = parseInt(e.target.value);
setUserProfile({ 
...userProfile, 
minAge: newMin,
maxAge: Math.max(newMin, userProfile.maxAge)
});
}}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.maxAge - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.maxAge - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.maxAge}
onChange={(e) => {
const newMax = parseInt(e.target.value);
setUserProfile({ 
...userProfile, 
maxAge: newMax,
minAge: Math.min(userProfile.minAge, newMax)
});
}}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
</div>
</div>

<div>
<label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Interests</label>
{suggestedInterests.length > 0 && (
<div className="mb-2">
<p className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Suggested:</p>
<div className="flex flex-wrap gap-1.5 mb-2">
{suggestedInterests.map((interest) => (
<button
key={interest}
onClick={() => toggleInterest(interest)}
className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
userProfile.interests.includes(interest)
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
{interest} ✨
</button>
))}
</div>
</div>
)}
<div className="flex flex-wrap gap-1.5">
{availableInterests.map((interest) => (
<button
key={interest}
onClick={() => toggleInterest(interest)}
className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
userProfile.interests.includes(interest)
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
{interest}
</button>
))}
</div>
</div>
</div>

{/* License Verification */}
<div className={`rounded-2xl p-4 ${darkMode ? 'bg-black border-2 border-white' : 'bg-white shadow border-2 border-black'}`}>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<div>
<h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Identity Verification</h3>
<p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get verified badge</p>
</div>
{userProfile.licenseVerified && (
<div className={`p-1 rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`}>
<svg className={`w-4 h-4 ${darkMode ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>
</div>
)}
</div>
</div>
<button
onClick={() => {
const confirmed = confirm('Upload your driver\'s license or passport to verify your identity.');
if (confirmed) {
setUserProfile({ ...userProfile, licenseVerified: true });
setIsVerified(true);
alert('✓ Verification submitted! Badge approved.');
}
}}
className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
userProfile.licenseVerified
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
{userProfile.licenseVerified ? '✓ Verified' : 'Verify Identity'}
</button>
</div>

<button onClick={completeProfile} className={`w-full py-3 rounded-xl font-bold transition-all ${userProfile.name && userProfile.bio && userProfile.image && userProfile.interests.length > 0 ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-gray-800 text-gray-600 border border-gray-700' : 'bg-gray-200 text-gray-400')}`}>
Complete Profile
</button>
</div>
</div>
</div>
);
}

// HOME
if (currentView === 'home') {
const totalUnreadMessages = matches.reduce((sum, match) => sum + (match.unreadMessages || 0), 0);

return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
<div className="max-w-md mx-auto p-4">
<div className="flex items-center justify-between mb-6">
<button onClick={() => setCurrentView('settings')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<Settings size={24} />
</button>
<div className="flex items-center gap-2">
<h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CheckIn</h1>
<Heart className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
</div>
<button onClick={() => setCurrentView('matches')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'} relative`}>
<MessageCircle size={24} />
{totalUnreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalUnreadMessages}</span>}
</button>
</div>

<div className={`rounded-2xl p-6 mb-6 shadow-lg ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}>
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Meet likeminded people</h2>
<p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check in to venues and discover people nearby</p>
</div>

<h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nearby Venues</h3>
      
<div className="space-y-4">
{[...venues].sort((a, b) => {
if (venueFilter === 'distance') {
return a.distance - b.distance;
} else {
return b.users - a.users;
}
}).map((venue) => (
<div key={venue.id} className={`rounded-2xl p-6 shadow-lg transition-all ${darkMode ? 'bg-black border-2 border-white' : 'bg-white hover:bg-gray-50'}`}>
<div className="flex items-center justify-between mb-2">
<h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{venue.name}</h3>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2">
<Users size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
<span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{venue.users}</span>
</div>
{/* Check-in Button */}
<button
onClick={() => {
if (checkedInVenueId === venue.id) {
checkOut();
} else {
checkIn(venue);
}
}}
className={`p-2 rounded-full transition-all ${
checkedInVenueId === venue.id
? 'bg-green-500 border-2 border-green-500'
: (darkMode ? 'bg-black border-2 border-white hover:bg-gray-900' : 'bg-white border-2 border-black hover:bg-gray-100')
}`}
>
<svg 
className={`w-6 h-6 ${checkedInVenueId === venue.id ? 'text-white' : (darkMode ? 'text-white' : 'text-black')}`} 
fill="none" 
stroke="currentColor" 
viewBox="0 0 24 24"
>
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
</svg>
</button>
</div>
</div>
<div className="flex items-center gap-4">
<span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{venue.type}</span>
<div className="flex items-center gap-1">
<MapPin size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
<span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
{distanceUnit === 'km' ? `${venue.distance} km` : `${(venue.distance * 0.621371).toFixed(1)} mi`}
</span>
</div>
</div>
</div>
))}
</div>

{/* Filters */}
<div className={`mt-6 rounded-2xl p-3 ${darkMode ? 'bg-black border-2 border-white' : 'bg-white shadow border-2 border-black'}`}>
<div className="grid grid-cols-2 gap-3">
<div>
<h4 className={`text-xs font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sort:</h4>
<div className="space-y-2">
<button
onClick={() => setVenueFilter('distance')}
className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
venueFilter === 'distance'
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
<MapPin size={12} className="inline mr-1" />
Closest
</button>
<button
onClick={() => setVenueFilter('popularity')}
className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
venueFilter === 'popularity'
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
<Users size={12} className="inline mr-1" />
Popular
</button>
</div>
</div>

<div>
<h4 className={`text-xs font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filter:</h4>
<div className="space-y-2">
<button
onClick={() => setCheckInFilter('radius')}
className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
checkInFilter === 'radius'
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
<MapPin size={12} className="inline mr-1" />
10km
</button>
<button
onClick={() => setCheckInFilter('checkins')}
className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
checkInFilter === 'checkins'
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border border-white' : 'bg-white text-black border border-black')
}`}
>
<Users size={12} className="inline mr-1" />
Check-ins
</button>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

// SETTINGS
if (currentView === 'settings') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
<div className="max-w-md mx-auto p-4">
<div className="flex items-center justify-between mb-6">
<button onClick={() => setCurrentView('home')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<ArrowLeft size={24} />
</button>
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
<div className="w-10"></div>
</div>

{/* Premium Subscription */}
<div className={`rounded-2xl p-6 mb-4 shadow-lg ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}>
<div className="flex items-center justify-between mb-4">
<div>
<h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
{isPremium ? '⭐ Premium Member' : 'Upgrade to Premium'}
</h3>
<p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
{isPremium ? 'Unlimited swipes, permanent messages & block users' : 'Get unlimited swipes and messages'}
</p>
</div>
</div>
{!isPremium && (
<>
<div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-black border border-white' : 'bg-white border border-black'}`}>
<p className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Premium Benefits:</p>
<ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
<li>✓ Unlimited swipes</li>
<li>✓ Messages never expire</li>
<li>✓ Incognito mode (browse privately)</li>
<li>✓ Block users you don't want to see</li>
</ul>
</div>
<div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-black border border-white' : 'bg-white border border-black'}`}>
<p className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Free Account:</p>
<ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
<li>• {swipesRemaining} swipes remaining this hour</li>
<li>• Messages disappear after 1 hour</li>
</ul>
</div>
<button
onClick={() => {
setIsPremium(true);
setSwipesRemaining(999);
alert('🎉 Welcome to Premium! You now have unlimited swipes, permanent messages, incognito mode, and the ability to block users.');
}}
className={`w-full py-3 rounded-xl font-bold ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
>
Upgrade Now - $4.99/month
</button>
</>
)}
{isPremium && (
<button
onClick={() => {
if (confirm('Cancel Premium subscription?')) {
setIsPremium(false);
setSwipesRemaining(5);
}
}}
className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-gray-100 text-gray-700'}`}
>
Manage Subscription
</button>
)}
</div>

<div className={`rounded-2xl p-6 mb-4 shadow-lg ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'} cursor-pointer hover:opacity-80 transition-all`} onClick={() => setCurrentView('profile')}>
<div className="flex items-center gap-3">
<User size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
<span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Profile</span>
</div>
</div>

<div className={`rounded-2xl p-6 mb-4 shadow-lg ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
{darkMode ? <Moon size={24} className="text-white" /> : <Sun size={24} className="text-gray-900" />}
<div>
<span className={`font-medium block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
{darkMode ? 'Dark Mode' : 'Light Mode'}
</span>
<span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
</span>
</div>
</div>
<button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full transition-all ${darkMode ? 'bg-white' : 'bg-gray-900'}`}>
<div className={`w-6 h-6 rounded-full transition-transform ${darkMode ? 'bg-gray-900 translate-x-7' : 'bg-white translate-x-1'}`}></div>
</button>
</div>

<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<MapPin size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
<span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Distance Unit</span>
</div>
<button onClick={() => setDistanceUnit(distanceUnit === 'km' ? 'mi' : 'km')} className={`px-4 py-2 rounded-full font-medium ${darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
{distanceUnit.toUpperCase()}
</button>
</div>

<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<Camera size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
<span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Face ID Login</span>
</div>
<button onClick={() => setFaceAuthEnabled(!faceAuthEnabled)} className={`w-14 h-8 rounded-full transition-all border-2 ${faceAuthEnabled ? (darkMode ? 'bg-white border-white' : 'bg-black border-black') : (darkMode ? 'bg-black border-white' : 'bg-white border-black')}`}>
<div className={`w-6 h-6 rounded-full transition-transform ${faceAuthEnabled ? (darkMode ? 'bg-black translate-x-7' : 'bg-white translate-x-7') : (darkMode ? 'bg-white translate-x-1' : 'bg-black translate-x-1')}`}></div>
</button>
</div>
</div>
</div>
</div>
);
}

// PROFILE
if (currentView === 'profile') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} p-4`}>
<div className="max-w-md mx-auto">
<div className="flex items-center justify-between mb-6">
<button onClick={() => setCurrentView('settings')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<ArrowLeft size={24} />
</button>
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Profile</h2>
<div className="w-10"></div>
</div>

<div className="space-y-6">
<div className="flex flex-col items-center">
<div className="relative">
{userProfile.image ? (
<img src={userProfile.image} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
) : (
<div className={`w-32 h-32 rounded-full flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
<Camera size={40} className={darkMode ? 'text-white' : 'text-black'} />
</div>
)}
<button onClick={() => fileInputRef.current.click()} className={`absolute bottom-0 right-0 p-2 rounded-full ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
<Camera size={20} />
</button>
<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
</div>
</div>

<div className={`rounded-2xl p-6 ${darkMode ? 'bg-black border-2 border-white' : 'bg-white shadow border-2 border-black'}`}>
<label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Gender</label>
<div className="grid grid-cols-2 gap-4 mb-4">
<button onClick={() => setUserGender('female')} className={`py-3 rounded-xl font-medium transition-all ${userGender === 'female' ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black')}`}>
Female
</button>
<button onClick={() => setUserGender('male')} className={`py-3 rounded-xl font-medium transition-all ${userGender === 'male' ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black')}`}>
Male
</button>
</div>

<input
type="text"
placeholder="Name"
value={userProfile.name}
onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
className={`w-full px-4 py-3 rounded-xl mb-4 focus:outline-none ${darkMode ? 'bg-black text-white border-2 border-white placeholder-gray-600' : 'bg-white text-gray-900 border-2 border-black placeholder-gray-500'}`}
/>

<div className="mb-4">
<label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Age: {userProfile.age}</label>
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.age - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.age - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.age}
onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) })}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
</div>

<textarea
placeholder="Bio"
value={userProfile.bio}
onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
className={`w-full px-4 py-3 rounded-xl mb-4 h-24 focus:outline-none resize-none ${darkMode ? 'bg-black text-white border-2 border-white placeholder-gray-600' : 'bg-white text-gray-900 border-2 border-black placeholder-gray-500'}`}
/>

<div className="mb-4">
<label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
Interested in ages: {userProfile.minAge} - {userProfile.maxAge}
</label>
<div className="space-y-2">
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.minAge - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.minAge - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.minAge}
onChange={(e) => {
const newMin = parseInt(e.target.value);
setUserProfile({ 
...userProfile, 
minAge: newMin,
maxAge: Math.max(newMin, userProfile.maxAge)
});
}}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
<div className="relative w-full h-6 flex items-center">
<div 
className="absolute w-full h-1 rounded-full border border-white"
style={{
background: `linear-gradient(to right, #fff ${((userProfile.maxAge - 18) / (99 - 18)) * 100}%, #000 ${((userProfile.maxAge - 18) / (99 - 18)) * 100}%)`
}}
/>
<input
type="range"
min="18"
max="99"
value={userProfile.maxAge}
onChange={(e) => {
const newMax = parseInt(e.target.value);
setUserProfile({ 
...userProfile, 
maxAge: newMax,
minAge: Math.min(userProfile.minAge, newMax)
});
}}
className="w-full absolute"
style={{ background: 'transparent' }}
/>
</div>
</div>
</div>

<div>
<label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Interests</label>
{suggestedInterests.length > 0 && (
<div className="mb-2">
<p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Suggested from your bio:</p>
<div className="flex flex-wrap gap-2 mb-3">
{suggestedInterests.map((interest) => (
<button
key={interest}
onClick={() => toggleInterest(interest)}
className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
userProfile.interests.includes(interest)
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black')
}`}
>
{interest} ✨
</button>
))}
</div>
</div>
)}
<div className="flex flex-wrap gap-2">
{availableInterests.map((interest) => (
<button
key={interest}
onClick={() => toggleInterest(interest)}
className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
userProfile.interests.includes(interest)
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black')
}`}
>
{interest}
</button>
))}
</div>
</div>
</div>

{/* ID Verification */}
<div className={`rounded-2xl p-6 ${darkMode ? 'bg-black border-2 border-white' : 'bg-white shadow border-2 border-black'}`}>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className={`p-2 rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`}>
<svg className={`w-6 h-6 ${darkMode ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
</svg>
</div>
<div>
<h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ID Verification</h3>
<p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Verify your identity</p>
</div>
</div>
{isVerified && (
<div className={`p-2 rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`}>
<svg className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>
</div>
)}
</div>
          
<button
onClick={() => {
const confirmed = confirm('Upload your driver\'s license or passport to verify your identity. This helps keep the community safe.');
if (confirmed) {
setIsVerified(true);
setUserProfile({ ...userProfile, licenseVerified: true });
alert('✓ Verification submitted! Your profile will show a verification badge once approved.');
}
}}
className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
isVerified
? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
: (darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black')
}`}
>
{isVerified ? '✓ Verified' : 'Upload ID to Verify'}
</button>
</div>

<button onClick={() => setCurrentView('settings')} className={`w-full py-4 rounded-xl font-bold transition-all ${darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
Save Changes
</button>
</div>
</div>
</div>
);
}

// DISCOVER
if (currentView === 'discover' && checkedInVenue) {
const availableProfiles = profiles.filter(profile => !blockedUsers.includes(profile.id));

if (availableProfiles.length === 0) {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center p-4`}>
<div className="text-center">
<h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No More Profiles</h2>
<p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check back later for new people at this venue!</p>
<button onClick={checkOut} className={`px-6 py-3 rounded-full font-bold ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
Check Out
</button>
</div>
</div>
);
}

const currentProfile = availableProfiles[currentProfileIndex % availableProfiles.length];

return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
<div className="max-w-md mx-auto h-screen flex flex-col">
<div className="p-4 flex items-center justify-between">
<button onClick={checkOut} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<ArrowLeft size={24} />
</button>
<div className="flex flex-col items-center gap-1">
<div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black shadow'}`}>
<div className="flex items-center gap-2">
<MapPin size={16} className={darkMode ? 'text-white' : 'text-black'} />
<span className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>{checkedInVenue.name}</span>
</div>
</div>
{isIncognito && (
<span className="text-xs text-purple-500 font-medium">🕶️ Incognito Mode</span>
)}
</div>
<button onClick={() => setCurrentView('matches')} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'} relative`}>
<MessageCircle size={24} />
{matches.reduce((sum, match) => sum + (match.unreadMessages || 0), 0) > 0 && (
<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
{matches.reduce((sum, match) => sum + (match.unreadMessages || 0), 0)}
</span>
)}
</button>
</div>

<div className="flex-1 px-4 pb-4">
<div className={`relative h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${swipeDirection === 'up' ? 'transform -translate-y-full opacity-0' : ''}`}>
<img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover" />
          
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
<div className="flex items-center gap-2 mb-2">
<h2 className="text-3xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
{isVerified && (
<div className="bg-white p-1 rounded-full">
<svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>
</div>
)}
</div>
<p className="text-lg mb-4">{currentProfile.bio}</p>
<div className="flex flex-wrap gap-2 mb-6">
{currentProfile.interests.map((interest, idx) => (
<span key={idx} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
{interest}
</span>
))}
</div>
            
<div className="flex justify-center">
<button onClick={handleConnect} className={`p-6 rounded-full hover:scale-110 transition-all shadow-lg ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}>
<Heart size={32} className={darkMode ? "text-white" : "text-black"} fill="currentColor" />
</button>
</div>
            
<div className="text-center mt-4 opacity-70">
<p className="text-sm">Swipe up to skip</p>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

// MATCHES
if (currentView === 'matches') {
return (
<div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
<div className="max-w-md mx-auto p-4">
<div className="flex items-center justify-between mb-6">
<button onClick={() => { setCheckedInVenue(null); setCurrentView('home'); }} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<Home size={24} />
</button>
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
<div className="w-10"></div>
</div>

{matches.length === 0 ? (
<div className="text-center mt-20">
<MessageCircle size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
<p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No connections yet</p>
</div>
) : (
<div className="space-y-4">
{matches.map((match) => (
<div key={match.id} onClick={() => openChat(match.id)} className={`rounded-2xl p-4 shadow-lg flex items-center gap-4 cursor-pointer hover:shadow-xl transition-all ${darkMode ? 'bg-black border-2 border-white hover:border-gray-300' : 'bg-white hover:bg-gray-50'}`}>
<img src={match.image} alt={match.name} className="w-16 h-16 rounded-full object-cover" />
<div className="flex-1">
<h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{match.name}, {match.age}</h3>
<p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{match.bio}</p>
</div>
<div className="relative">
<button className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
<MessageCircle size={20} />
</button>
{match.unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{match.unreadMessages}</span>}
</div>
</div>
))}
</div>
)}
</div>
</div>
);
}

  // CHAT
  if (currentView === 'chat' && activeChat) {
    const currentMatch = matches.find(m => m.id === activeChat);
    const chatMessages = messages[activeChat] || [];

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} flex flex-col`}>
        <div className={`${darkMode ? 'bg-black border-white' : 'bg-white border-black'} border-b p-4 flex items-center gap-3`}>
          <button onClick={() => { setActiveChat(null); setCurrentView('matches'); }} className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
            <ArrowLeft size={20} />
          </button>
          <img src={currentMatch && currentMatch.image} alt={currentMatch && currentMatch.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{currentMatch && currentMatch.name}</h3>
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">Encrypted</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Block button clicked!', activeChat);
              blockUser(activeChat);
            }}
            className={`p-2 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'} hover:opacity-70 transition-all`}
            title="Block User"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              {msg.sender === 'system' ? (
                <div className="text-center">
                  <span className={`text-xs px-4 py-2 rounded-full ${darkMode ? 'bg-black border border-white text-white' : 'bg-white border border-black text-black'}`}>{msg.text}</span>
                </div>
              ) : (
                <div className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-xs">
                    {msg.type === 'image' || msg.type === 'gif' ? (
                      <img src={msg.url} alt="Shared" className="rounded-2xl max-w-full" />
                    ) : msg.type === 'video' ? (
                      <video src={msg.url} controls className="rounded-2xl max-w-full" />
                    ) : (
                      <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-black border border-white text-white' : 'bg-white border border-black text-black'}`}>
                        <p>{msg.text}</p>
                      </div>
                    )}
                    <div className={`text-xs mt-1 flex items-center gap-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} text-gray-500`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.sender === 'me' && (
                        <span className={`text-xs ${darkMode ? 'text-white' : 'text-black'}`}>
                          {msg.status === 'delivered' && '✓'}
                          {msg.status === 'read' && '✓✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-black border border-white' : 'bg-white border border-black'}`}>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white' : 'bg-black'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white' : 'bg-black'}`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white' : 'bg-black'}`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showAttachMenu && (
          <div className={`${darkMode ? 'bg-black border-white' : 'bg-white border-black'} p-4 border-t`}>
            <div className="grid grid-cols-5 gap-3">
              <button onClick={() => cameraInputRef.current.click()} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}><Camera size={20} className={darkMode ? 'text-white' : 'text-black'} /></div>
                <span className="text-xs text-gray-400">Camera</span>
              </button>
              <button onClick={() => { attachInputRef.current.accept = 'image/*'; attachInputRef.current.click(); }} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}><Image size={20} className={darkMode ? 'text-white' : 'text-black'} /></div>
                <span className="text-xs text-gray-400">Photo</span>
              </button>
              <button onClick={() => { attachInputRef.current.accept = 'video/*'; attachInputRef.current.click(); }} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}><Video size={20} className={darkMode ? 'text-white' : 'text-black'} /></div>
                <span className="text-xs text-gray-400">Video</span>
              </button>
              <button onClick={sendGif} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}><Smile size={20} className={darkMode ? 'text-white' : 'text-black'} /></div>
                <span className="text-xs text-gray-400">GIF</span>
              </button>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white' : 'bg-white border-2 border-black'}`}><Smile size={20} className={darkMode ? 'text-white' : 'text-black'} /></div>
                <span className="text-xs text-gray-400">Emoji</span>
              </button>
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className={`${darkMode ? 'bg-black border-white' : 'bg-white border-black'} p-4 border-t`}>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji, idx) => (
                <button key={idx} onClick={() => addEmoji(emoji)} className={`text-2xl p-2 rounded-lg ${darkMode ? 'hover:bg-gray-900 border border-white' : 'hover:bg-gray-100 border border-black'}`}>{emoji}</button>
              ))}
            </div>
          </div>
        )}

        <div className={`${darkMode ? 'bg-black border-white' : 'bg-white border-black'} border-t p-4`}>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }} className={`p-3 rounded-full ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}>
              <Paperclip size={20} />
            </button>
            <input ref={attachInputRef} type="file" onChange={handleAttachmentUpload} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleAttachmentUpload} className="hidden" />
            <input 
              type="text" 
              value={messageInput} 
              onChange={(e) => setMessageInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
              placeholder={
                userGender === 'female' 
                  ? "Type a message..." 
                  : (messages[activeChat] || []).some(msg => msg.sender === 'other')
                    ? "Type a message..."
                    : "Women message first..."
              }
              disabled={userGender !== 'female' && !(messages[activeChat] || []).some(msg => msg.sender === 'other')}
              className={`flex-1 px-4 py-3 rounded-full focus:outline-none ${darkMode ? 'bg-black text-white placeholder-gray-600 border-2 border-white' : 'bg-white text-black placeholder-gray-400 border-2 border-black'}`}
            />
            <button 
              onClick={sendMessage} 
              disabled={!messageInput.trim() || (userGender !== 'female' && !(messages[activeChat] || []).some(msg => msg.sender === 'other'))}
              className={`p-3 rounded-full transition-all ${darkMode ? 'bg-black border-2 border-white text-white' : 'bg-white border-2 border-black text-black'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }


// Incognito Check-In Modal
if (showIncognitoModal && pendingCheckInVenue) {
return (
<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
<div className="bg-black border-2 border-white rounded-3xl p-8 max-w-md w-full">
<h2 className="text-2xl font-bold text-white mb-4">Check-In Options</h2>
<p className="text-gray-400 mb-6">
Choose how you want to check in to {pendingCheckInVenue.name}
</p>

<div className="space-y-4">
<button
onClick={() => confirmCheckIn(false)}
className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
>
<div className="flex flex-col items-center">
<span className="text-lg mb-1">Regular Check-In</span>
<span className="text-sm font-normal">Visible to all users at this venue</span>
</div>
</button>
        
<button
onClick={() => confirmCheckIn(true)}
className="w-full bg-black text-white border-2 border-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all"
>
<div className="flex flex-col items-center">
<span className="text-lg mb-1">🔒 Incognito Mode</span>
<span className="text-sm font-normal">You only appear to profiles you heart ❤️</span>
</div>
</button>
</div>
      
<button
onClick={() => {
setShowIncognitoModal(false);
setPendingCheckInVenue(null);
}}
className="w-full mt-4 text-gray-400 hover:text-white transition-all py-2"
>
Cancel
</button>
</div>
</div>
);
}

// Block User Modal
if (showBlockModal && userToBlock) {
const userToBlockDetails = matches.find(m => m.id === userToBlock);

return (
<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
<div className="bg-black border-2 border-white rounded-3xl p-8 max-w-md w-full">
<h2 className="text-2xl font-bold text-white mb-4">Block User?</h2>
<p className="text-gray-400 mb-6">
Are you sure you want to block {userToBlockDetails?.name || 'this user'}? They will no longer appear in your matches at any venue.
</p>
      
<div className="space-y-3">
<button
onClick={confirmBlockUser}
className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
>
Yes, Block User
</button>
        
<button
onClick={cancelBlockUser}
className="w-full bg-black text-white border-2 border-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all"
>
Cancel
</button>
</div>
</div>
</div>
);
}

return null;
};

export default CheckInApp;

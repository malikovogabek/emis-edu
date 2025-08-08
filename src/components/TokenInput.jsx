import { useState, useEffect } from "react";

function TokenInput() {
    const [token, setToken] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("token");
        if (saved) setToken(saved);
    }, []);

    const handleSave = () => {
        localStorage.setItem("token", token);
        alert("✅ Token saqlandi!");
    };

    return (
        <div className="mb-6 p-4 bg-white border dark:bg-gray-800 border-gray-300 rounded shadow-sm max-w-xl">
            <h2 className="text-md  font-semibold mb-2 text-gray-700">🔐 Ixtiyoriy: EMIS token kiriting</h2>
            <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Tokenni shu yerga kiriting"
                className="w-full border p-2 rounded mb-3"
            />
            <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
            >
                Saqlash
            </button>
        </div>
    );
}

export default TokenInput;

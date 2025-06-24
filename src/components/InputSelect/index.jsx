import { useState, useEffect, useRef } from "react";

export function InputSelect({ defaultValue = "", classes = "", data = [], noChange = false, label = "Tanlang", onSelect }) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const wrapperRef = useRef(null);

    // 🔄 data yoki inputValue o‘zgarganda filter qilish
    useEffect(() => {
        if (!inputValue) {
            setFilteredData(data);
        } else {
            const filtered = data.filter(item =>
                item.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [data, inputValue]);

    // 🔒 tashqariga bosilganda yopish
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setIsOpen(true);
    };

    const handleSelect = (item) => {
        setInputValue(item.name);
        setIsOpen(false);
        if (onSelect) onSelect(item);
    };

    return (
        <div className={`relative ${classes}`} ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <input
                type="text"
                value={inputValue}
                onChange={noChange ? () => { } : handleInputChange}
                onClick={() => setIsOpen(!isOpen)}
                readOnly={noChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm cursor-pointer"
                placeholder="Tanlang yoki qidiring..."
            />

            {isOpen && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                    {filteredData.length > 0 ? (
                        filteredData.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-600 cursor-pointer"
                            >
                                {item.name}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500 dark:text-gray-300">Hech narsa topilmadi</li>
                    )}
                </ul>
            )}
        </div>
    );
}
export default InputSelect
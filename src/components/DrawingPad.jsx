import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Save, Trash2, Type, Move } from 'lucide-react';

const DrawingPad = ({ onSave, initialData }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (initialData) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = initialData;
        }
    }, [initialData]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);

        // Save state for undo
        setHistory([...history, canvasRef.current.toDataURL()]);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
    };

    const undo = () => {
        if (history.length === 0) return;
        const prevState = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = prevState;
    };

    const handleSave = () => {
        if (onSave) {
            onSave(canvasRef.current.toDataURL());
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[500px]">
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex space-x-2">
                    <button onClick={undo} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600" title="Undo">
                        <Undo size={20} />
                    </button>
                    <button onClick={clear} className="p-2 hover:bg-white rounded-lg transition-colors text-red-500" title="Clear">
                        <Trash2 size={20} />
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: color }}></div>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-0 h-0 opacity-0 absolute"
                            id="colorPicker"
                        />
                        <label htmlFor="colorPicker" className="text-xs font-bold text-gray-500 cursor-pointer">Color</label>
                    </div>
                    <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="text-sm font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none text-slate-600 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="2">Thin</option>
                        <option value="5">Medium</option>
                        <option value="10">Thick</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-repeat">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    width={500}
                    height={400}
                    className="w-full h-full touch-none cursor-crosshair"
                />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md flex items-center justify-center"
                >
                    <Save size={18} className="mr-2" /> Save Drawing
                </button>
            </div>
        </div>
    );
};

export default DrawingPad;

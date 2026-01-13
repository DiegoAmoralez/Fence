import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

const SignaturePad = ({ onEnd }) => {
    const sigPad = useRef({});

    const clear = () => {
        sigPad.current.clear();
        if (onEnd) onEnd(null);
    }

    const handleEnd = () => {
        if (onEnd) {
            onEnd(sigPad.current.toDataURL());
        }
    }

    return (
        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner">
            <SignatureCanvas
                penColor="black"
                canvasProps={{ width: 350, height: 150, className: 'sigCanvas w-full h-40' }}
                ref={sigPad}
                onEnd={handleEnd}
            />
            <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-end">
                <button
                    type="button"
                    onClick={clear}
                    className="text-gray-500 hover:text-red-500 text-sm flex items-center px-3 py-1"
                >
                    <Eraser size={16} className="mr-1" /> Clear
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;

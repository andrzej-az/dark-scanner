import React, { useEffect, useRef } from 'react'; // Import InputMask from react-input-mask
import { Input, InputProps } from './input';
import Inputmask from "inputmask";

export const MaskInput: React.FC<InputProps> = ({ value, onChange, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Apply the IP address mask using the "ip" alias
    Inputmask("ip").mask(inputRef.current as HTMLInputElement);
  }, []);

  return (
      <Input
        id="ip-address"
        ref={inputRef}
        value={value}
        onChange={onChange}
        {...props}
      />
  );
};

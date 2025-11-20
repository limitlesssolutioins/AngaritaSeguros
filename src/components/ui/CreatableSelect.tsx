import { useState, useEffect } from 'react';
import Creatable from 'react-select/creatable';

interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  apiUrl: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  onCreate: (inputValue: string) => Promise<Option>; // Should return the new option
  placeholder?: string;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({ apiUrl, value, onChange, onCreate, placeholder }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const formattedOptions = data.map((item: any) => ({ value: item.id, label: item.name }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, [apiUrl]);

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    try {
      const newOption = await onCreate(inputValue);
      setOptions((prev) => [...prev, newOption]);
      onChange(newOption);
    } catch (error) {
      console.error('Failed to create option:', error);
    }
    setIsLoading(false);
  };

  return (
    <Creatable
      isClearable
      isDisabled={isLoading}
      isLoading={isLoading}
      onChange={onChange}
      onCreateOption={handleCreate}
      options={options}
      value={value}
      placeholder={placeholder || 'Selecciona o crea...'}
    />
  );
};

export default CreatableSelect;

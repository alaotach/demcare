import React from 'react';
import { TextInput as PaperTextInput, TextInputProps } from 'react-native-paper';
import { TextInput as RNTextInput, ViewStyle } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  // Add any additional props if needed
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  contentStyle, 
  style,
  ...props 
}) => {
  // Ensure autofill is completely disabled
  const disabledAutofillProps = {
    autoComplete: 'off' as const,
    textContentType: 'none' as const,
    importantForAutofill: 'no' as const,
    autoCorrect: false,
    spellCheck: false,
  };

  // Enhanced content style that aggressively prevents autofill styling
  const enhancedContentStyle = {
    backgroundColor: '#FAFBFC',
    color: '#000000',
    ...contentStyle,
  };

  // Enhanced main style
  const enhancedStyle = [
    {
      backgroundColor: '#FAFBFC',
    },
    style,
  ];

  return (
    <PaperTextInput
      {...props}
      {...disabledAutofillProps}
      style={enhancedStyle}
      contentStyle={enhancedContentStyle}
      render={(innerProps) => {
        // Create a unique key to force re-render and prevent autofill caching
        const uniqueKey = `input-${Date.now()}-${Math.random()}`;
        
        return (
          <RNTextInput
            {...innerProps}
            key={uniqueKey}
            {...disabledAutofillProps}
            style={[
              innerProps.style,
              {
                backgroundColor: '#FAFBFC',
                color: '#000000',
              }
            ]}
          />
        );
      }}
    />
  );
};

export default CustomTextInput;

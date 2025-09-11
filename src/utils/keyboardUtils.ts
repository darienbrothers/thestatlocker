import { Keyboard, Platform, Dimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export interface KeyboardInfo {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export const useKeyboardAwareScrolling = () => {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardInfo>({
    keyboardHeight: 0,
    isKeyboardVisible: false,
  });

  const scrollViewRef = useRef<any>(null);
  const activeInputRef = useRef<any>(null);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      event => {
        setKeyboardInfo({
          keyboardHeight: event.endCoordinates.height,
          isKeyboardVisible: true,
        });

        // Scroll to active input after a short delay
        setTimeout(() => {
          if (activeInputRef.current && scrollViewRef.current) {
            // Check if measureInWindow method exists before calling it
            if (typeof activeInputRef.current.measureInWindow === 'function') {
              activeInputRef.current.measureInWindow(
                (_x: number, y: number, _width: number, height: number) => {
                  const screenHeight = Dimensions.get('window').height;
                  const keyboardTop = screenHeight - event.endCoordinates.height;
                  const inputBottom = y + height;

                  // Add padding to ensure input is clearly visible above keyboard
                  const padding = 20;

                  if (inputBottom + padding > keyboardTop) {
                    const scrollOffset = inputBottom + padding - keyboardTop;
                    scrollViewRef.current?.scrollTo({
                      y: scrollOffset,
                      animated: true,
                    });
                  }
                },
              );
            }
          }
        }, 100);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardInfo({
          keyboardHeight: 0,
          isKeyboardVisible: false,
        });
      },
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const handleInputFocus = (inputRef: any) => {
    activeInputRef.current = inputRef;
  };

  const handleInputBlur = () => {
    activeInputRef.current = null;
  };

  return {
    keyboardInfo,
    scrollViewRef,
    handleInputFocus,
    handleInputBlur,
  };
};

export const getKeyboardAvoidingViewProps = () => ({
  behavior: Platform.OS === 'ios' ? 'padding' : ('height' as const),
  keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
});

export const dismissKeyboard = () => {
  Keyboard.dismiss();
};

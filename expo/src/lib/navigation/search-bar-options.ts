import { type NativeStackNavigationOptions } from '@react-navigation/native-stack';

type HeaderSearchBarOptions = NonNullable<
  NativeStackNavigationOptions['headerSearchBarOptions']
>;

type BuildSearchBarOptionsParams = {
  placeholder: string;
  onChangeText: (text: string) => void;
  onCancel?: () => void;
};

export function buildSearchBarOptions({
  placeholder,
  onChangeText,
  onCancel,
}: BuildSearchBarOptionsParams): HeaderSearchBarOptions {
  return {
    placeholder,
    autoCapitalize: 'none',
    hideWhenScrolling: true,
    onChangeText: (event) => onChangeText(event.nativeEvent.text),
    onSearchButtonPress: (event) => onChangeText(event.nativeEvent.text),
    onCancelButtonPress: () => onCancel?.(),
  };
}

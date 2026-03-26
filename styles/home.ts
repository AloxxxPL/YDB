import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  topPadding: {
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  dietButton: {
    height: 180,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  navBtn: {
    padding: 8,
  },
  navDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#000',
  },
  cameraDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
  },
});

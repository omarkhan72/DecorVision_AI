import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  onBack: () => void;
  onContinue?: (prompt: string) => void;
  originalImageUri: string;
  maskImageUri: string;
};

const ReplacePromptScreen = ({ onBack, onContinue, originalImageUri, maskImageUri }: Props) => {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [suggestions] = useState([
    'A modern red leather sofa',
    'A white minimalist chair',
    'A wooden coffee table',
    'A glass dining table',
    'A blue velvet armchair',
    'A marble side table',
    'A black leather recliner',
    'A vintage wooden desk',
  ]);

  const handleContinue = () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter what you want to replace the selected area with');
      return;
    }

    console.log('=== Replace Prompt Submitted ===');
    console.log('Original image:', originalImageUri);
    console.log('Mask image:', maskImageUri);
    console.log('Replacement prompt:', prompt);
    onContinue?.(prompt.trim());
  };

  const handleSuggestionPress = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What to Replace With?</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Describe what you want to replace the selected area with
          </Text>
        </View>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., A modern red leather sofa"
            placeholderTextColor="#9CA3AF"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.characterCount}>{prompt.length} characters</Text>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={!prompt.trim()}>
          <View style={[styles.gradient, !prompt.trim() && styles.gradientDisabled]}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  instructionContainer: {
    marginTop: 24,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  gradientDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReplacePromptScreen;


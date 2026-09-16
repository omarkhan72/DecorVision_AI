import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DEFAULT_PROMPT =
  'Generate a realistic 3D render of this floor plan. Create a modern interior design with natural lighting, high-quality textures, contemporary furniture, and a warm, inviting atmosphere. Include detailed ceiling, flooring, and wall finishes.';

const QUICK_STYLES = [
  { label: 'Modern', icon: 'home-modern', prompt: 'Generate a realistic 3D render with a sleek modern interior, minimalist furniture, clean lines, and neutral tones with natural lighting.' },
  { label: 'Luxury', icon: 'crown', prompt: 'Generate a luxurious 3D render with premium materials, gold accents, high-end furniture, marble flooring, and sophisticated lighting.' },
  { label: 'Scandinavian', icon: 'pine-tree', prompt: 'Generate a cozy Scandinavian 3D render with light wood tones, white walls, hygge-inspired decor, and warm ambient lighting.' },
  { label: 'Industrial', icon: 'factory', prompt: 'Generate an industrial 3D render with exposed brick walls, concrete floors, metal fixtures, Edison bulb lighting, and raw textures.' },
  { label: 'Bohemian', icon: 'flower', prompt: 'Generate a boho-chic 3D render with vibrant colors, layered textiles, eclectic furniture, plants, and warm earthy tones.' },
  { label: 'Minimalist', icon: 'view-dashboard-outline', prompt: 'Generate a minimalist 3D render with clean empty spaces, monochrome palette, simple furniture, and abundant natural light.' },
];

type Props = {
  onBack: () => void;
  onGenerate: (prompt: string) => void;
  blueprintImageUri: string;
};

const BlueprintPromptScreen = ({ onBack, onGenerate, blueprintImageUri }: Props) => {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleStylePress = (style: typeof QUICK_STYLES[0]) => {
    setSelectedStyle(style.label);
    setPrompt(style.prompt);
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={18} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>3D Design Prompt</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Blueprint Preview Thumbnail */}
          <View style={styles.thumbnailRow}>
            <Image source={{ uri: blueprintImageUri }} style={styles.thumbnail} />
            <View style={styles.thumbnailInfo}>
              <View style={styles.stepTag}>
                <Text style={styles.stepText}>Floor Plan to 3D</Text>
              </View>
              <Text style={styles.thumbnailTitle}>Blueprint ready</Text>
              <Text style={styles.thumbnailSub}>Customize your prompt below</Text>
            </View>
          </View>

          {/* Quick Style Chips */}
          <Text style={styles.sectionTitle}>Quick Styles</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}>
            {QUICK_STYLES.map((style) => (
              <TouchableOpacity
                key={style.label}
                style={[
                  styles.styleChip,
                  selectedStyle === style.label && styles.styleChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleStylePress(style)}>
                <MaterialCommunityIcons
                  name={style.icon as any}
                  size={18}
                  color={selectedStyle === style.label ? '#FFFFFF' : '#8B5CF6'}
                />
                <Text
                  style={[
                    styles.styleChipText,
                    selectedStyle === style.label && styles.styleChipTextActive,
                  ]}>
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt Editor */}
          <Text style={styles.sectionTitle}>Your Prompt</Text>
          <Text style={styles.sectionSub}>
            This prompt is pre-filled for great results. Feel free to edit it.
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={prompt}
              onChangeText={(text) => {
                setPrompt(text);
                setSelectedStyle(null);
              }}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
              placeholder="Describe your 3D render..."
            />
            {/* Reset button */}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setPrompt(DEFAULT_PROMPT);
                setSelectedStyle(null);
              }}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="refresh" size={16} color="#8B5CF6" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.charCount}>{prompt.length} characters</Text>
        </ScrollView>

        {/* Generate Button */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.generateButton, !prompt.trim() && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            activeOpacity={0.9}
            disabled={!prompt.trim()}>
            <MaterialCommunityIcons name="cube-outline" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>generate 3d render</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    paddingTop: 20,
    paddingBottom: 120,
  },
  /* Blueprint thumbnail row */
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    gap: 14,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#E5E7EB',
  },
  thumbnailInfo: {
    flex: 1,
    gap: 4,
  },
  stepTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  thumbnailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  thumbnailSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  /* Section headings */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: -6,
  },
  /* Style chips */
  chipsScroll: {
    paddingBottom: 24,
    gap: 8,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    backgroundColor: '#FFFFFF',
  },
  styleChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  styleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  styleChipTextActive: {
    color: '#FFFFFF',
  },
  /* Text input */
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  textInput: {
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 130,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    justifyContent: 'flex-end',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 8,
  },
  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8B5CF6',
    paddingVertical: 17,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'lowercase',
    letterSpacing: 0.3,
  },
});

export default BlueprintPromptScreen;

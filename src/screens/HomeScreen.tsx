import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Custom Fence Icon Component (Three Vertical Bars)
const FenceIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View style={[styles.fenceIcon, { width: size, height: size }]}>
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
  </View>
);

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  const categories = [
    { name: 'Interior Design', icon: 'couch', isCustom: false }, // Sofa icon
    { name: 'Exterior Design', icon: 'home', isCustom: false },
    { name: 'Garden Design', icon: 'fence', isCustom: true }, // Custom three vertical bars
  ];

  const featureCards = [
    {
      id: 1,
      title: 'Interior Design',
      description: 'Transform your interior space',
      image: require('../assets/images/interior-design.jpg'),
    },
    {
      id: 2,
      title: 'Exterior Design',
      description: 'Transform your exterior space',
      image: require('../assets/images/exterior-design.jpg'),
    },
    {
      id: 3,
      title: 'Garden Design',
      description: 'Transfer your garden',
      image: require('../assets/images/garden-design.jpg'),
    },
    {
      id: 4,
      title: 'Replace',
      description: 'Replace any part of your space',
      image: require('../assets/images/replace.jpg'),
    },
    {
      id: 5,
      title: 'Style Transfer',
      description: 'Apply style from reference image',
      image: require('../assets/images/style-transfer.jpg'),
    },
    {
      id: 6,
      title: 'New walls',
      description: 'Change paint wall paper and more',
      image: require('../assets/images/new-walls.jpg'),
    },
    {
      id: 7,
      title: 'New Flooring',
      description: 'Chose wood, carpet, tile, and more',
      image: require('../assets/images/new-flooring.jpg'),
    },
    {
      id: 8,
      title: 'Cleanup',
      description: 'Delete selected object',
      image: require('../assets/images/cleanup.jpg'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrapper}>
            <MaterialCommunityIcons name="flower" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTextRegular}>Dream </Text>
            <Text style={styles.logoTextPurple}>Ai</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.proButton}>
            <FontAwesome name="star" size={16} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={styles.proButtonText}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <FontAwesome5 name="cog" size={24} color="#1A1A1A" solid={false} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Category Navigation - Horizontal ScrollView */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
            style={styles.categoryScrollView}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryButton}>
                <View style={styles.categoryIconContainer}>
                  {category.isCustom ? (
                    <FenceIcon size={18} color="#FFFFFF" />
                  ) : (
                    <FontAwesome
                      name={category.icon}
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {featureCards.map((card) => (
            <TouchableOpacity key={card.id} style={styles.card}>
              <Image source={card.image} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
                <FontAwesome name="chevron-right" size={20} color="#1A1A1A" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainerActive}>
            <FontAwesome name="home" size={24} color="#8B5CF6" />
          </View>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="th" size={24} color="#1A1A1A" />
          <Text style={styles.navText}>Design</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="clock-o" size={24} color="#1A1A1A" />
          <Text style={styles.navText}>History</Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '400',
  },
  logoTextRegular: {
    fontWeight: '400',
    color: '#1A1A1A',
  },
  logoTextPurple: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
  },
  categoryScrollView: {
    maxHeight: 60,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    marginRight: 10,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flexShrink: 0,
    includeFontPadding: false,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navIconContainerActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  navTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  fenceIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fenceBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default HomeScreen;

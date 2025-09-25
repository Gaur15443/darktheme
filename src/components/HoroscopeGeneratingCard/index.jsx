import {Text, useTheme} from 'react-native-paper';
import {View, StyleSheet, Dimensions} from 'react-native';
import GradientView from '../../common/gradient-view';
import AstroHoroscopeUnlockIcon from '../../images/Icons/AstrologyHoroscopeIcon/AstroHoroscopeUnlockIcon';
import {useSelector} from 'react-redux';
import SparkleIcon from '../../images/Icons/SparkleIcon';
import SpinningWheel from '../../common/SpinningWheel';
import ShiningButton from '../../common/ShiningButton';
import { memo } from 'react';

function GeneratingHoroscopeCard({width, isScrolling = false}) {
  const height = isScrolling ? 100 : 300;
  const theme = useTheme();
  const infoTexts = useSelector(
    state =>
      state.getToastMessages.toastMessages?.ai_astro_reports
        ?.horoscope_generating_message,
  );

  const cardWidth =
    typeof width === 'string' ? Dimensions.get('window').width : width;
  const dialSize = Math.max(height, cardWidth) * 1.3;

  return (
    <View
      style={[
        styles.container,
        {
          height,
          width,
          borderRadius: isScrolling ? 16 : 8,
          borderColor: isScrolling ? 'rgba(139, 98, 37, 0.3)' : '#FFFFFF1A',
        },
      ]}>
      <GradientView
        colors={
          isScrolling
            ? ['rgba(139, 98, 37, 0.9)', 'rgba(71, 52, 28, 0.95)', '#2A1F1A']
            : ['rgba(43, 37, 45, 0.85)', '#0E0E10']
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientView}
        contentStyle={[
          styles.gradientContent,
          isScrolling ? {} : {paddingHorizontal: 24},
          isScrolling && styles.shrunkenContent,
        ]}>
        {/* Background spinning dial - only show when not scrolling */}
        {!isScrolling && (
          <View
            style={[StyleSheet.absoluteFill, {zIndex: 1}]}
            pointerEvents="none">
            <View style={styles.centerAll}>
              <SpinningWheel
                source={require('../../images/horoscopeBackground.png')}
                size={100}
                duration={40000}
                style={{
                  width: dialSize / 1.3,
                  height: dialSize / 1.3,
                  borderRadius: dialSize / 2,
                  opacity: 0.1,
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        )}

        {isScrolling ? (
          // Shrunken layout
          <>
            <ShiningButton style={styles.shiningShrunkButton}>
              <View style={styles.shrunkenIcon}>
                <AstroHoroscopeUnlockIcon stroke="#6B46C1" />
              </View>
              <View style={styles.shrunkenTextContainer}>
                <Text variant="bold" style={styles.shrunkenTitle}>
                  We will notify you once it's ready.
                </Text>
                <Text style={styles.shrunkenSubtitle}>
                  Available after 24 hours
                </Text>
              </View>
            </ShiningButton>
          </>
        ) : (
          // Full layout
          <>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <AstroHoroscopeUnlockIcon stroke={theme.colors.primary} />
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text variant="bold" style={styles.mainTitle}>
                Personalized horoscope
              </Text>
              <Text style={styles.buttonText}>
                It will take approximately 24 hours for it to be ready. We will
                notify you once it's ready.
              </Text>
            </View>

            {/* Status message with sparkles */}
            <View style={styles.statusContainer}>
              <SparkleIcon style={{transform: [{scaleX: -1}]}} />
              <Text variant="bold" style={styles.statusText}>
                {infoTexts?.messageStatus}
              </Text>
              <SparkleIcon />
            </View>

            {/* Gradient Button */}
            <View style={styles.buttonContainer}>
              <ShiningButton style={styles.shiningButton}>
                <GradientView
                  colors={['rgba(255, 187, 61, 0.5)', '#151109']}
                  style={styles.buttonGradient}
                  contentStyle={styles.buttonContent}>
                  <Text variant="bold" style={styles.buttonText}>
                    {infoTexts?.cta_text}
                  </Text>
                </GradientView>
              </ShiningButton>
            </View>
          </>
        )}
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradientView: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  gradientContent: {
    height: '100%',
    width: '100%',

    paddingVertical: 10,
    overflow: 'hidden',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  shrunkenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // paddingHorizontal: 20,
    paddingVertical: 20,
  },
  centerAll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  shrunkenIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  mainSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#FF9D00',
    flexShrink: 1,
    textAlign: 'center',
    textShadowColor: '#FFFFFF40',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
    padding: 10,
    fontSize: 16,
    borderRadius: 10,
  },
  buttonContainer: {
    alignContent: 'center',
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'rgba(255, 187, 61, 0.5)',
  },
  shiningButton: {
    width: '100%',
    borderColor: 'rgba(255, 187, 61, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
  },
  shiningShrunkButton: {
    width: '100%',
    borderColor: 'rgba(255, 187, 61, 0.5)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 100,
  },
  buttonGradient: {
    flexGrow: 1,
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonContent: {
    padding: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  shrunkenTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  shrunkenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  shrunkenSubtitle: {
    fontSize: 13,
    color: '#E5E5E5',
    fontWeight: '500',
  },
});

export default memo(GeneratingHoroscopeCard)
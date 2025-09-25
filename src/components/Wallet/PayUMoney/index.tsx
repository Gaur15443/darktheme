import React, {Fragment} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, Paragraph} from 'react-native-paper';
import GradientView from '../../../common/gradient-view';

interface PayuMoneyProps {
  heading: string;
  icon: React.ReactElement;
  subtitle: string;
  closeButtonText: string;
  onClose: () => void;
  children?: React.ReactNode;
  showModal: boolean;
}

const PayuMoney: React.FC<PayuMoneyProps> = ({
  heading,
  icon,
  subtitle,
  closeButtonText,
  onClose,
  children,
  showModal,
}) => {
  if (!showModal) return null;

  return (
    <Fragment>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <GradientView
            style={styles.gradient}
            contentStyle={styles.gradientContent}
            variant="modal">
            {/* Close Button */}

            {/* Icon */}
            <View style={styles.iconWrapper}>{icon}</View>

            {/* Heading */}
            <Paragraph style={styles.heading}>{heading}</Paragraph>

            {/* Subtitle */}
            <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>

            <Button
              mode="outlined"
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              theme={{colors: {primary: '#fff'}}}
              onPress={onClose}>
              {closeButtonText}
            </Button>

            {children && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.childrenScroll}>
                {children}
              </ScrollView>
            )}
          </GradientView>
        </View>
      </TouchableWithoutFeedback>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 2, 2, 0.93)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  gradient: {
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  gradientContent: {
    minHeight: 200,
    padding: 19,
    paddingTop: 30,
  },
  closeButton: {
    position: 'absolute',
    top: -13,
    right: -8,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 5,
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#fff',
  },
  actionButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 20,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  childrenScroll: {
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default PayuMoney;

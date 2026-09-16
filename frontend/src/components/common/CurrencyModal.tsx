import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Globe, Check, Sparkles, Compass } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Modal } from './Modal';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext';

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ visible, onClose }) => {
  const {
    currentCurrency,
    currencyCode,
    isAutoMode,
    detectedCurrencyCode,
    setCurrency,
    setAutoMode,
  } = useCurrency();

  const detectedInfo = SUPPORTED_CURRENCIES[detectedCurrencyCode] || SUPPORTED_CURRENCIES.USD;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Currency & Regional Units"
      maxWidth={520}
    >
      <View style={styles.container}>
        {/* Auto Detection Card */}
        <View style={[styles.autoCard, isAutoMode && styles.autoCardActive]}>
          <View style={styles.autoLeft}>
            <View style={styles.autoIconBg}>
              <Compass size={18} color={isAutoMode ? colors.primary : colors.textTertiary} />
            </View>
            <View style={styles.autoMeta}>
              <View style={styles.autoHeaderRow}>
                <Text style={styles.autoTitle}>Automatic Regional Detection</Text>
                <View style={[styles.statusPill, isAutoMode ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, isAutoMode ? styles.statusActiveText : styles.statusInactiveText]}>
                    {isAutoMode ? 'ACTIVE' : 'MANUAL OVERRIDE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.autoSubtitle}>
                Detected from timezone/locale: {detectedInfo.flag} {detectedInfo.name} ({detectedInfo.code})
              </Text>
            </View>
          </View>
          <Switch
            value={isAutoMode}
            onValueChange={(val) => setAutoMode(val)}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.sectionHeading}>Select Enterprise Currency</Text>
        <Text style={styles.sectionDesc}>
          All revenue metrics, invoice totals, deal pipeline values, and project budgets will dynamically re-calculate in your chosen currency.
        </Text>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
            const isSelected = currencyCode === curr.code;
            const isAutoDetectedItem = detectedCurrencyCode === curr.code;

            return (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyRow,
                  isSelected && styles.currencyRowSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setCurrency(curr.code);
                  onClose();
                }}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.flagText}>{curr.flag}</Text>
                  <View style={styles.currencyMeta}>
                    <View style={styles.codeRow}>
                      <Text style={styles.currencyCode}>{curr.code}</Text>
                      <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                      {isAutoDetectedItem && (
                        <View style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>Your Region</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.currencyName}>{curr.name}</Text>
                  </View>
                </View>

                <View style={styles.rowRight}>
                  <Text style={styles.rateText}>
                    {curr.code === 'USD' ? 'Base (1.00)' : `1 USD ≈ ${curr.symbol}${curr.rate.toFixed(2)}`}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={13} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footerNote}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.footerText}>
            Real-time rate conversions apply automatically across all 9 connected business modules.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  autoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  autoCardActive: {
    borderColor: 'rgba(37, 99, 235, 0.3)',
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  autoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  autoIconBg: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  autoMeta: {
    flex: 1,
  },
  autoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  autoTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusActive: {
    backgroundColor: colors.successBg,
  },
  statusInactive: {
    backgroundColor: colors.warningBg,
  },
  statusText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  statusActiveText: {
    color: colors.success,
  },
  statusInactiveText: {
    color: colors.warning,
  },
  autoSubtitle: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  sectionDesc: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  listContainer: {
    maxHeight: 280,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  currencyRowSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: colors.primary,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  currencyMeta: {
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyCode: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencySymbol: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  regionBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  regionBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },
  currencyName: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rateText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily,
    flex: 1,
  },
});

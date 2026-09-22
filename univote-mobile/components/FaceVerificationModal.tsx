import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { api, FacialConfig, FacialVerifyResult } from '@/services/api';
import FaceCapture from './FaceCapture';

export type FaceVerificationAction = 'enroll' | 'verify' | 'reenroll';

interface FaceVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  action: FaceVerificationAction;
  context?: 'voting' | 'profile' | 'general';
  mandatory?: boolean;
  onSuccess?: (result: { session_token?: string; facial_config: FacialConfig }) => void;
}

type Step = 'idle' | 'capture' | 'processing' | 'success' | 'failed';

export default function FaceVerificationModal({
  visible,
  onClose,
  action,
  context = 'general',
  mandatory = false,
  onSuccess,
}: FaceVerificationModalProps) {
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<FacialVerifyResult | null>(null);
  const [qualityDetail, setQualityDetail] = useState<{
    brightness?: number;
    sharpness?: number;
    min_required?: number;
  } | null>(null);

  const handleClose = () => {
    if (mandatory && step !== 'success') {
      Alert.alert(
        'Face Enrollment Required',
        'Facial registration is mandatory for account security. You cannot complete registration without enrolling your face. Are you sure you want to cancel registration?',
        [
          { text: 'Continue Enrollment', style: 'default' },
          {
            text: 'Cancel Registration',
            style: 'destructive',
            onPress: () => {
              setStep('idle');
              setError(null);
              setErrorCode(null);
              setMatchScore(null);
              setAttemptsRemaining(null);
              setLastResult(null);
              setQualityDetail(null);
              onClose();
            },
          },
        ]
      );
      return;
    }

    setStep('idle');
    setError(null);
    setErrorCode(null);
    setMatchScore(null);
    setAttemptsRemaining(null);
    setLastResult(null);
    setQualityDetail(null);
    onClose();
  };

  const startCapture = () => {
    setStep('capture');
    setError(null);
    setErrorCode(null);
  };

  const handleCapture = useCallback(
    async (faceData: string, qualityScore: number) => {
      setStep('processing');

      try {
        if (action === 'enroll' || action === 'reenroll') {
          const result = await api.enrollFace(faceData, qualityScore);
          if (result.data && !result.error && result.data.success) {
            setStep('success');
            setTimeout(() => {
              onSuccess?.({
                session_token: result.data?.session_token,
                facial_config: result.data!.facial_config,
              });
              handleClose();
            }, 1200);
          } else {
            setStep('failed');
            const errMsg = result.error || (result.data as any)?.error || 'Enrollment failed.';
            setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
            setErrorCode(result.error_code || (result.data as any)?.error_code || null);
            if (result.quality_detail || (result.data as any)?.quality_detail) {
              setQualityDetail(result.quality_detail || (result.data as any)?.quality_detail);
            }
          }
        } else {
          const ctx = context === 'voting' ? 'voting' : context === 'profile' ? 'general' : 'general';
          const result = await api.verifyFace(faceData, ctx);
          setLastResult(result.data || null);

          if (result.data && !result.error && result.data.verified) {
            setMatchScore(result.data.match_score);
            setStep('success');
            setTimeout(() => {
              onSuccess?.({
                session_token: result.data?.session_token,
                facial_config: result.data?.facial_config!,
              });
              handleClose();
            }, 1200);
          } else {
            setStep('failed');
            setMatchScore(result.match_score ?? result.data?.match_score ?? null);
            const errMsg = result.data?.message || result.error || (result.data as any)?.error || 'Verification failed.';
            setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
            setErrorCode(result.error_code || result.data?.error_code || null);
            setAttemptsRemaining(result.attempts_remaining ?? result.data?.attempts_remaining ?? null);
            if (result.quality_detail || result.data?.quality_detail || result.error?.includes('quality')) {
              setQualityDetail(result.quality_detail || result.data?.quality_detail || null);
            }
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setStep('failed');
        setError(msg);
      }
    },
    [action, context, onSuccess]
  );

  const tryAgain = () => {
    setStep('capture');
    setError(null);
    setErrorCode(null);
    setMatchScore(null);
    setQualityDetail(null);
  };

  const handleResetAttempts = async () => {
    const res = await api.resetFacialAttempts();
    if (res.data) {
      Alert.alert('Attempts Reset', 'Verification attempts have been reset.');
      setAttemptsRemaining(5);
      tryAgain();
    } else {
      Alert.alert('Error', res.error || 'Could not reset attempts.');
    }
  };

  const getTitle = () => {
    if (action === 'enroll') return 'Enroll Face Verification';
    if (action === 'reenroll') return 'Re-Enroll Face';
    return 'Verify Your Identity';
  };

  const getDescription = () => {
    if (action === 'enroll') return 'Secure your account by enrolling your face. A clear, full face capture is required before you can vote.';
    if (action === 'reenroll') return 'Capture your face again to update your registered facial profile.';
    if (context === 'voting') return 'Before casting your vote, we must verify that your face matches the registered voter profile.';
    return 'Verify your identity using facial recognition.';
  };

  const renderErrorGuidance = () => {
    if (errorCode === 'no_face_detected') {
      return (
        <View style={styles.guidanceBox}>
          <Ionicons name="person-outline" size={24} color={Colors.error} />
          <View style={styles.guidanceTextWrap}>
            <Text style={styles.guidanceTitle}>No Face Detected</Text>
            <Text style={styles.guidanceDesc}>
              Make sure your face is clearly visible inside the oval frame and the camera is not covered.
            </Text>
          </View>
        </View>
      );
    }

    if (errorCode === 'half_face_detected') {
      return (
        <View style={styles.guidanceBox}>
          <Ionicons name="scan-outline" size={24} color={Colors.error} />
          <View style={styles.guidanceTextWrap}>
            <Text style={styles.guidanceTitle}>Partial Face / Cut Off</Text>
            <Text style={styles.guidanceDesc}>
              Your full face from forehead to chin must be inside the oval guide. Do not tilt away or hold the camera too close.
            </Text>
          </View>
        </View>
      );
    }

    if (errorCode === 'face_blurred') {
      return (
        <View style={styles.guidanceBox}>
          <Ionicons name="eye-off-outline" size={24} color={Colors.error} />
          <View style={styles.guidanceTextWrap}>
            <Text style={styles.guidanceTitle}>Blurry Capture</Text>
            <Text style={styles.guidanceDesc}>
              Hold your phone steady while capturing. Ensure there is plenty of light on your face.
            </Text>
          </View>
        </View>
      );
    }

    if (errorCode === 'no_match') {
      return (
        <View style={styles.guidanceBox}>
          <Ionicons name="shield-outline" size={24} color={Colors.error} />
          <View style={styles.guidanceTextWrap}>
            <Text style={styles.guidanceTitle}>Identity Mismatch</Text>
            <Text style={styles.guidanceDesc}>
              The scanned face does not match the registered voter. You cannot vote unless your face matches your registered profile.
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const isLockedOut = errorCode === 'locked_out';

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      {step === 'capture' ? (
        <FaceCapture
          mode={action === 'verify' ? 'verify' : 'enroll'}
          onCapture={handleCapture}
          onCancel={handleClose}
          instruction={
            action === 'verify'
              ? 'Please look straight into the camera to verify your identity.'
              : 'Fit your full face inside the oval frame without blur or obstruction.'
          }
        />
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getTitle()}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {step === 'idle' && (
              <View style={styles.idleSection}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={action === 'verify' ? 'shield-checkmark-outline' : 'person-add-outline'}
                    size={56}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.sectionTitle}>{getTitle()}</Text>
                <Text style={styles.sectionDesc}>{getDescription()}</Text>

                {mandatory && (
                  <View style={styles.mandatoryBanner}>
                    <Ionicons name="alert-circle" size={18} color="#C62828" />
                    <Text style={styles.mandatoryBannerText}>
                      Mandatory Step: You must enroll your face to finish registration and be eligible to vote.
                    </Text>
                  </View>
                )}

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={styles.infoText}>Full face must be inside the oval frame</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={styles.infoText}>Hold steady to avoid blur and ensure good lighting</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={styles.infoText}>Voting requires matching your registered face</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={startCapture}>
                  <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>
                    {action === 'verify' ? 'Start Verification' : 'Start Enrollment'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ghostBtn} onPress={handleClose}>
                  <Text style={styles.ghostBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'processing' && (
              <View style={styles.statusCenter}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.statusText}>
                  {action === 'verify' ? 'Verifying facial similarity...' : 'Analyzing face quality...'}
                </Text>
                {matchScore !== null && (
                  <Text style={styles.subText}>Match: {Math.round(matchScore * 100)}%</Text>
                )}
              </View>
            )}

            {step === 'success' && (
              <View style={styles.statusCenter}>
                <View style={[styles.statusIcon, styles.successIcon]}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
                <Text style={styles.successText}>
                  {action === 'verify' ? 'Identity Verified!' : 'Face Enrolled!'}
                </Text>
                <Text style={styles.subText}>
                  {action === 'verify'
                    ? 'Your face matched the registered profile. You can now cast your vote.'
                    : 'Your facial profile has been saved successfully.'}
                </Text>
                {matchScore !== null && (
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>Match: {Math.round(matchScore * 100)}%</Text>
                  </View>
                )}
              </View>
            )}

            {step === 'failed' && (
              <View style={styles.statusCenter}>
                <View style={[styles.statusIcon, styles.failedIcon]}>
                  <Ionicons name="close" size={44} color="#fff" />
                </View>
                <Text style={styles.failedText}>
                  {action === 'verify' ? 'Verification Failed' : 'Enrollment Rejected'}
                </Text>

                {matchScore !== null && (
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>Match: {Math.round(matchScore * 100)}%</Text>
                  </View>
                )}

                {renderErrorGuidance()}

                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{error || 'Please try again.'}</Text>
                  {qualityDetail && (qualityDetail.brightness !== undefined || qualityDetail.sharpness !== undefined) && (
                    <View style={styles.qualityDetailWrap}>
                      {qualityDetail.brightness !== undefined && (
                        <Text style={styles.qualityDetailText}>
                          Brightness: {Math.round(qualityDetail.brightness)}%
                          {qualityDetail.min_required ? ` / required ${qualityDetail.min_required}%` : ''}
                        </Text>
                      )}
                      {qualityDetail.sharpness !== undefined && (
                        <Text style={styles.qualityDetailText}>
                          Sharpness: {Math.round(qualityDetail.sharpness)}%
                          {qualityDetail.min_required ? ` / required ${qualityDetail.min_required}%` : ''}
                        </Text>
                      )}
                    </View>
                  )}
                  {attemptsRemaining !== null && !isLockedOut && (
                    <Text style={styles.attemptsText}>
                      Attempts remaining: {attemptsRemaining}
                    </Text>
                  )}
                </View>

                {isLockedOut ? (
                  <>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleResetAttempts}>
                      <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
                      <Text style={styles.secondaryBtnText}>Reset & Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn} onPress={handleClose}>
                      <Text style={styles.ghostBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.primaryBtn} onPress={tryAgain}>
                      <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn} onPress={handleClose}>
                      <Text style={styles.ghostBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 24, paddingBottom: 40 },
  idleSection: { alignItems: 'center', paddingTop: 16 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: '800', color: '#1a2a3a',
    marginBottom: 10, textAlign: 'center',
  },
  sectionDesc: {
    fontSize: 14, color: '#667788', textAlign: 'center',
    lineHeight: 20, marginBottom: 28, paddingHorizontal: 8,
  },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    width: '100%', marginBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  infoText: {
    marginLeft: 10, fontSize: 13, color: '#1a2a3a', fontWeight: '500',
  },
  statusCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40,
  },
  statusText: { marginTop: 18, fontSize: 16, fontWeight: '700', color: '#1a2a3a' },
  subText: { marginTop: 8, fontSize: 13, color: '#667788', textAlign: 'center' },
  statusIcon: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center', marginBottom: 22,
  },
  successIcon: { backgroundColor: Colors.success },
  failedIcon: { backgroundColor: Colors.error },
  successText: { fontSize: 22, fontWeight: '800', color: Colors.success, marginBottom: 10 },
  failedText: { fontSize: 22, fontWeight: '800', color: Colors.error, marginBottom: 10 },
  scorePill: {
    marginTop: 12, paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: Colors.primaryBg, borderRadius: 20, marginBottom: 18,
  },
  scoreText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  errorCard: {
    width: '100%', backgroundColor: '#FFEBEE', borderRadius: 14,
    padding: 16, marginVertical: 12, marginBottom: 24,
  },
  errorText: { fontSize: 14, color: Colors.error, fontWeight: '600', textAlign: 'center' },
  attemptsText: {
    marginTop: 8, fontSize: 12, color: '#880E4F',
    textAlign: 'center', fontWeight: '600',
  },
  qualityDetailWrap: {
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8,
  },
  qualityDetailText: {
    fontSize: 12, color: '#880E4F', fontWeight: '500',
    textAlign: 'center', marginVertical: 2,
  },
  primaryBtn: {
    width: '100%', height: 52, backgroundColor: Colors.primary,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', marginTop: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    width: '100%', height: 52,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', marginTop: 6,
    borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700', marginLeft: 6 },
  ghostBtn: {
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 6,
  },
  ghostBtnText: {
    color: '#8899aa', fontSize: 14, fontWeight: '600',
  },
  mandatoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  mandatoryBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
    lineHeight: 16,
  },
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    width: '100%',
    gap: 12,
  },
  guidanceTextWrap: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  guidanceDesc: {
    fontSize: 12,
    color: '#BF360C',
    lineHeight: 17,
  },
});

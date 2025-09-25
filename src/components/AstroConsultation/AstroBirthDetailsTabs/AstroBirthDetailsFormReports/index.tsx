import {
  View,
} from 'react-native';
import React, { memo, useCallback } from 'react';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import AstroBirthForm from '../../../AstrologyBirthForm';
import type { Kundli } from '../../../../store/apps/astroKundali';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
interface AstroBirthDetailsFormProps {
  onConfirm?: () => void;
  onNewKundli?: (params: Kundli) => void;
}

function AstroBirthDetailsFormReports({
  onNewKundli = () => undefined
}: AstroBirthDetailsFormProps) {
  const { bottom }: EdgeInsets = useSafeAreaInsets();
  const isOwnerKundliExists = useSelector((state: RootState) => state.astroKundaliSlice.ownerKundliExists);

  const handleRedirect = useCallback((data: Kundli) => {
    if (typeof onNewKundli === 'function') {
      onNewKundli(data);
    }
  }, []);

  return (
    <ErrorBoundary.Screen>
      <View style={{ flex: 1, }}>
        <AstroBirthForm style={{
          paddingHorizontal: 0
        }}
          customRedirect={handleRedirect}
          skipPopUp={isOwnerKundliExists}
          bottomOffset={bottom + 60}
        />
      </View >
    </ErrorBoundary.Screen>
  );
}


export default memo(AstroBirthDetailsFormReports);

import React, {useEffect, useState} from 'react';
import {Svg, Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import PropTypes from 'prop-types';

const SonIcon = ({isDisabled = false, ...props}) => {
  const colors = {
    disabled: ['#FFFFFF', '#FFFFFF'],
    enabled: 'url(#sonIconGradient)',
  };

  const [fillColor, setFillColor] = useState(colors.enabled);

  useEffect(() => {
    if (isDisabled) {
      setFillColor(colors.disabled);
    } else {
      setFillColor(colors.enabled);
    }
  }, [isDisabled]);

  return (
    <Svg width={67} height={88} viewBox="0 0 67 88" fill="none" {...props}>
      <Path
        fill={fillColor}
        d="M0 75.498c.8-5.777 6.357-10.889 13.083-11.941 1.238-.194 2.5-.262 3.761-.33 1.656-.09 3.31-.18 4.907-.552 2.813-.657 3.785-2.621 3.661-5.115a68.362 68.362 0 0 1-.017-.39v-.001c-.077-1.722-.139-3.129-1.828-4.156-1.816-1.104-2.685-1.995-4.057-3.486-2.003-2.178-2.754-5.166-2.788-7.936-.017-1.387-.154-2.986-.298-4.668-.136-1.595-.279-3.264-.332-4.896-.88-.432-1.652-1.077-2.19-1.909-1.19-1.833-1.07-4.326.058-6.167a11.38 11.38 0 0 1-.545-.157c-2.271-.72-4.406-2.506-4.338-4.688.068-2.183 3.46-3.883 5.046-2.23-2.008-2.194-2.787-5.608-.938-7.914 1.85-2.305 6.636-2.13 7.548.606-.426-1.893-.384-3.938.558-5.664A5.758 5.758 0 0 1 26.303.869c2.131.056 4.13 1.76 3.998 3.687.775-1.948 3.213-3.201 5.438-2.822 2.225.38 3.998 2.327 4.032 4.403C41.44 4.1 44.94 3.58 47.22 5.04c2.28 1.462 2.957 4.646 1.44 6.781 3.384-.972 7.3 1.21 8.29 4.326.988 3.115-.755 6.657-3.747 8.396a9.37 9.37 0 0 1-.91.464 4.686 4.686 0 0 1-1.07 6.639c-.351.245-.733.441-1.134.583-.058 1.562-.193 3.155-.323 4.68-.144 1.686-.28 3.29-.297 4.681-.038 2.77-.784 5.758-2.787 7.936-1.376 1.491-2.242 2.386-4.057 3.486-1.693 1.025-1.755 2.439-1.832 4.166l-.018.381c-.123 2.485.853 4.45 3.665 5.114 1.591.377 3.238.464 4.888.55h.001c1.267.068 2.535.135 3.78.333 6.624 1.037 12.095 6.01 13.04 11.678-8.833 7.86-20.47 12.634-33.224 12.634-12.61 0-24.13-4.668-32.926-12.371Z"
      />
      <Defs>
        <LinearGradient id="sonIconGradient" gradientTransform="rotate(90)">
          <Stop offset="0%" stopColor="#6FC1EE" />
          <Stop offset="95%" stopColor="#B6E5FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

SonIcon.propTypes = {
  isDisabled: PropTypes.bool,
};

SonIcon.displayName = 'SonIcon';

export default SonIcon;

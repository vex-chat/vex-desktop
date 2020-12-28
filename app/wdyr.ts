/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  const ReactRedux = require('react-redux');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackExtraHooks: [
      [ReactRedux, 'useSelector']
    ],
    logOnDifferentValues: true
  });
}
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
};

const setAccessTokenCookie = (res, accessToken) => {
  const options = getCookieOptions();
  options.maxAge = 15 * 60 * 1000; // 15 minutes
  
  res.cookie('access_token', accessToken, options);
};

const setRefreshTokenCookie = (res, refreshToken) => {
  const options = getCookieOptions();
  options.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  res.cookie('refresh_token', refreshToken, options);
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
};

module.exports = {
  getCookieOptions,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies
};

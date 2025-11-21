// Debug commands to run in browser console
// Open your React app and run these in the browser console

// 1. Check if authService is available
console.log('Auth Service:', window.authService);

// 2. Check current user
console.log('Current User:', window.authService?.getCurrentUser());

// 3. Check if user is logged in
console.log('Is Logged In:', window.authService?.isLoggedIn());

// 4. Check Supabase auth state
console.log('Supabase Client:', window.supabase);

// 5. Get Supabase user
if (window.supabase) {
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    console.log('Supabase User:', user);
    console.log('Supabase Error:', error);
  });
}

// 6. Check localStorage for user data
console.log('Local Storage User:', localStorage.getItem('user'));

// 7. Try to manually trigger auth state change
if (window.authService) {
  window.authService.init().then(() => {
    console.log('Auth initialized, current user:', window.authService.getCurrentUser());
  });
}



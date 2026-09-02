<?php
/* Login, and first run setup. On a fresh install there is no password yet, so
   the first visitor sets one. After that this is a plain login. */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

/* Start the session before a single byte of output. mp_csrf() would
   otherwise start it mid page, by which time the cookie can no longer be
   sent and every login fails with an expired form. */
mp_session_start();

$setup = !mp_is_configured();
$err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($setup) {
        $u = trim((string)($_POST['user'] ?? ''));
        $p = (string)($_POST['pass'] ?? '');
        $p2 = (string)($_POST['pass2'] ?? '');
        if ($u === '' || strlen($p) < 10)      $err = 'Choose a username and a password of at least 10 characters.';
        elseif ($p !== $p2)                     $err = 'The two passwords do not match.';
        elseif (!mp_save_settings(array('admin_user'=>$u, 'admin_hash'=>password_hash($p, PASSWORD_DEFAULT))))
                                                $err = 'Could not write the settings file. Check that ' . MP_DATA_DIR . ' exists and is writable.';
        else { mp_login($u, $p); header('Location: index.php'); exit; }
    } else {
        if (!mp_csrf_ok($_POST['csrf'] ?? null)) {
            $err = 'The form expired. Try again.';
        } elseif (mp_login(trim((string)($_POST['user'] ?? '')), (string)($_POST['pass'] ?? ''))) {
            header('Location: index.php'); exit;
        } else {
            /* Deliberately vague, and slowed down, so the form cannot be used
               to work out which usernames exist. */
            usleep(400000);
            $err = 'Those details were not accepted.';
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?php echo $setup ? 'Set up' : 'Sign in'; ?> · MedPark Dashboard</title>
<link rel="stylesheet" href="assets/dash.css?v=<?php echo MP_VERSION; ?>">
</head>
<body class="login">
  <div class="login__box">
    <h1><?php echo $setup ? 'Set up the dashboard' : 'MedPark dashboard'; ?></h1>
    <p class="sub">
      <?php echo $setup
        ? 'Choose the login for this dashboard. It is stored above the web root, hashed, never in plain text.'
        : 'Performance and reporting for MedPark Health Group.'; ?>
    </p>

    <?php if ($err): ?><div class="note note--bad"><?php echo e($err); ?></div><?php endif; ?>

    <form method="post">
      <?php if (!$setup): ?><input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>"><?php endif; ?>
      <div class="field">
        <label>Username</label>
        <input type="text" name="user" autocomplete="username" required
               value="<?php echo $setup ? '' : ''; ?>" autofocus>
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" name="pass" autocomplete="<?php echo $setup ? 'new-password' : 'current-password'; ?>" required>
      </div>
      <?php if ($setup): ?>
      <div class="field">
        <label>Repeat password</label>
        <input type="password" name="pass2" autocomplete="new-password" required>
      </div>
      <?php endif; ?>
      <button class="btn btn--pri" type="submit" style="width:100%;justify-content:center;padding:11px">
        <?php echo $setup ? 'Create login' : 'Sign in'; ?>
      </button>
    </form>
  </div>
</body>
</html>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Job Rotation</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

  <!-- Navbar -->
  <div id="navbar-placeholder"></div>

  <script>
    fetch('navbar.html')
      .then(response => response.text())
      .then(data => document.getElementById('navbar-placeholder').innerHTML = data);
  </script>

  <div class="container mt-5">
    <h2>Login</h2>
    <form id="loginForm">
      <div class="mb-3">
        <label for="email" class="form-label">E-mail</label>
        <input type="email" class="form-control" id="email" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Senha</label>
        <input type="password" class="form-control" id="password" required>
      </div>
      <button type="submit" class="btn btn-primary">Entrar</button>
    </form>
    <a href="cadastro.html">Cadastre-se</a>
  </div>

</body>
</html>
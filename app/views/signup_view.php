<?php ?>
<form action="/signup/registration" method="POST">
    <p>
    <p> <strong>Ваш логин</strong>:</p>
    <input type="text" name="login" value="<?php echo $data['login']; ?>">
    </p>
    <p>
    <p> <strong>Ваш e-mail</strong>:</p>
    <input type="email" name="email" value="<?php echo $data['email']; ?>">
    </p>
    <p>
    <p>  <strong>Ваш пароль</strong>:</p>
    <input type="password" name="password">
    </p>
    <p>
    <p>  <strong>Введите пароль повторно</strong>:</p>
    <input type="password" name="password_сonfirm">
    </p>
    <p>
        <button type="submit" name="do_signup">Зарегистрироваться</button>
    </p>
</form>

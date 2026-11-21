<div>
    <h1>Profile Setup</h1>
    <form method="POST" action="{{ route('profile-setup') }}">
        @csrf
        <x-forms.form-field type="text" name="username" label="Username" :value="$user->username" required />
        <x-forms.form-field type="text" name="name" label="Name" :value="$user->name" required />
        <button type="submit">Save Profile</button>
    </form>
</div>

'use server';

export async function logFormData(formData: FormData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');

    console.log('Form Data Received:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);

    // In a real application, you would save this to a database here.
}

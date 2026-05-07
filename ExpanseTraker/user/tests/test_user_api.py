from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()

class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()   
    
    def test_user_registration(self):
        url = reverse('user-register')
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')
    def test_user_exsiting_registration(self):
        User.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')    
        url = reverse('user-register')
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',   
            'password': 'testpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)
    def test_user_login(self):
        User.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword',verfied=True)
        url = reverse('user-login')
        data = {
            'email': 'testuser@example.com',    
            'password': 'testpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_user_login_unverified(self):
        User.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword', verified=False)    
        url = reverse('user-login')
        data = {
            'email': 'testuser@example.com',    

            'password': 'testpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('access', response.data)
    
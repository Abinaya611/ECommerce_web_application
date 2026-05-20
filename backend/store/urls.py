from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns=[
    path('test/',views.test_api),
    path('auth/register/',views.register),
    path('auth/login/',TokenObtainPairView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),
    path('products/', views.product_list),
    path('cart/', views.get_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/remove/<int:item_id>/', views.remove_from_cart),
    path('cart/update/', views.update_cart_item),
    path('orders/place/', views.place_order),
    path('orders/history/', views.order_history),
    path('categories/', views.category_list),
    path('products/<int:pk>/', views.product_detail),
    path('profile/', views.user_profile, name='user-profile'),
    path('my-orders/', views.my_orders, name='my-orders'),
    path('admin/products/', views.admin_create_product),
    path('admin/products/<int:pk>/', views.admin_product_detail),
    path('admin/orders/', views.admin_all_orders),
    path('admin/orders/<int:pk>/status/', views.admin_update_order_status),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('cart/clear/', views.clear_cart),

]
    
    
    
    
    
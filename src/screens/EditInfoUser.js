import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import Icon from 'react-native-vector-icons/Ionicons';

const EditarDatosScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    edad: '',
    especialidad: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (route.params?.userData) {
      const { userData } = route.params;
      setFormData({
        nombre: userData.nombre || '',
        correo: userData.correo || '',
        edad: userData.edad?.toString() || '',
        especialidad: userData.especialidad || '',
      });
    }
  }, [route.params]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.edad.trim()) {
      newErrors.edad = 'La edad es requerida';
    } else if (isNaN(formData.edad) || parseInt(formData.edad) < 18 || parseInt(formData.edad) > 100) {
      newErrors.edad = 'La edad debe ser un número entre 18 y 100';
    }

    if (!formData.especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es requerida';
    }

    // Validar contraseña si se está cambiando
    if (showPasswordSection) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Ingresa tu contraseña actual';
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = 'Ingresa una nueva contraseña';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar datos en Firestore
      await updateDoc(doc(database, 'usuarios', user.uid), {
        nombre: formData.nombre,
        edad: parseInt(formData.edad),
        especialidad: formData.especialidad,
        fechaActualizacion: new Date().toISOString(),
      });

      // Cambiar contraseña si se solicitó
      if (showPasswordSection && passwordData.newPassword) {
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordData.currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwordData.newPassword);
      }

      Alert.alert(
        'Actualización Exitosa',
        'Tu información ha sido actualizada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error al actualizar:', error);
      
      let errorMessage = 'Ocurrió un error al actualizar la información';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'La contraseña actual es incorrecta';
          break;
        case 'auth/weak-password':
          errorMessage = 'La nueva contraseña es muy débil';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Debes iniciar sesión nuevamente para cambiar la contraseña';
          break;
        default:
          if (error.message.includes('auth/')) {
            errorMessage = 'Error de autenticación: ' + error.message;
          }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const updatePasswordData = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Información</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            {/* Campo Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                value={formData.nombre}
                onChangeText={(value) => updateFormData('nombre', value)}
                placeholder="Ingresa tu nombre completo"
                autoCapitalize="words"
              />
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            {/* Campo Correo (Solo lectura) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.correo}
                placeholder="correo@ejemplo.com"
                editable={false}
              />
              <Text style={styles.infoText}>
                El correo electrónico no se puede modificar
              </Text>
            </View>

            {/* Campo Edad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={[styles.input, errors.edad && styles.inputError]}
                value={formData.edad}
                onChangeText={(value) => updateFormData('edad', value)}
                placeholder="Tu edad"
                keyboardType="numeric"
                maxLength={3}
              />
              {errors.edad && <Text style={styles.errorText}>{errors.edad}</Text>}
            </View>

            {/* Campo Especialidad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Especialidad</Text>
              <TextInput
                style={[styles.input, errors.especialidad && styles.inputError]}
                value={formData.especialidad}
                onChangeText={(value) => updateFormData('especialidad', value)}
                placeholder="Tu especialidad"
                autoCapitalize="words"
              />
              {errors.especialidad && <Text style={styles.errorText}>{errors.especialidad}</Text>}
            </View>
          </View>

          {/* Sección de Contraseña */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
              <Icon 
                name={showPasswordSection ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#3498db" 
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <>
                {/* Contraseña Actual */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña Actual</Text>
                  <TextInput
                    style={[styles.input, errors.currentPassword && styles.inputError]}
                    value={passwordData.currentPassword}
                    onChangeText={(value) => updatePasswordData('currentPassword', value)}
                    placeholder="Ingresa tu contraseña actual"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
                </View>

                {/* Nueva Contraseña */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nueva Contraseña</Text>
                  <TextInput
                    style={[styles.input, errors.newPassword && styles.inputError]}
                    value={passwordData.newPassword}
                    onChangeText={(value) => updatePasswordData('newPassword', value)}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                </View>

                {/* Confirmar Nueva Contraseña */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    value={passwordData.confirmPassword}
                    onChangeText={(value) => updatePasswordData('confirmPassword', value)}
                    placeholder="Confirma la nueva contraseña"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>
              </>
            )}
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Icon name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={20} color="#e74c3c" />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  inputDisabled: {
    backgroundColor: '#ecf0f1',
    color: '#7f8c8d',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  infoText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#e74c3c',
  },
});

export default EditarDatosScreen;
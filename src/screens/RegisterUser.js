import React, { useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';


const RegistroScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    edad: '',
    especialidad: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const especialidades = [
    'Desarrollo de Software',
    'Diseño Gráfico',
    'Automotríz',
    'Electronica',
    'Electromecánica',
    'Arquitectura',
    'Administrativo Contable'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.edad.trim()) {
      newErrors.edad = 'La edad es requerida';
    } else if (isNaN(formData.edad) || parseInt(formData.edad) < 18 || parseInt(formData.edad) > 100) {
      newErrors.edad = 'La edad debe ser un número entre 18 y 100';
    }

    if (!formData.especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistro = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.correo,
        formData.contraseña
      );

      // Guardar información adicional en Firestore
    await setDoc(doc(database, 'usuarios', userCredential.user.uid), {
      nombre: formData.nombre,
      correo: formData.correo,
      edad: parseInt(formData.edad),
      especialidad: formData.especialidad,
      fechaRegistro: new Date().toISOString(),
    });


      Alert.alert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HomeScreen')
          }
        ]
      );

    } catch (error) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Ocurrió un error durante el registro';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico no es válido';
          break;
        default:
          errorMessage = 'Error: ' + error.message;
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
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
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Ingresa tus datos para registrarte</Text>
        </View>

        <View style={styles.form}>
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

          {/* Campo Correo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, errors.correo && styles.inputError]}
              value={formData.correo}
              onChangeText={(value) => updateFormData('correo', value)}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, errors.contraseña && styles.inputError]}
              value={formData.contraseña}
              onChangeText={(value) => updateFormData('contraseña', value)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.contraseña && <Text style={styles.errorText}>{errors.contraseña}</Text>}
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

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Link para Login (opcional) */}
          <TouchableOpacity 
            style={styles.linkContainer}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RegistroScreen;
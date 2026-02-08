import { useState, useEffect, useRef } from 'react';
import './App.css';
import { FiPlus, FiDownload, FiX, FiCamera, FiLoader } from 'react-icons/fi';

// --- CONFIGURACIÓN ---
const CLOUD_NAME = 'drbzyhoss'; // <--- ¡PON TU CLOUD NAME AQUÍ!
const UPLOAD_PRESET = 'vsco_guest'; // <--- ¡ASEGÚRATE QUE SEA EL MISMO DE CLOUDINARY!
const TAG_NAME = 'album_quinces';

function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Estado para saber si está subiendo
  const [selectedImage, setSelectedImage] = useState(null);

  // Referencia al input oculto
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG_NAME}.json?v=${Date.now()}`
      );
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      setMedia(data.resources);
    } catch (error) {
      console.log('Esperando primeras fotos o error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // 1. AL HACER CLIC EN EL BOTÓN "SUBIR", ABRIMOS EL SELECTOR DE ARCHIVOS OCULTO
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // 2. CUANDO EL USUARIO ELIGE UNA FOTO
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true); // Activamos el spinner de carga

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('tags', TAG_NAME); // Importante para que aparezca en la lista

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      console.log('Subida exitosa:', data);

      // Recargamos la galería después de 2 segundos
      setTimeout(() => {
        fetchMedia();
        setUploading(false);
      }, 2000);
    } catch (error) {
      console.error('Error subiendo:', error);
      setUploading(false);
      alert('Hubo un error al subir la foto. Intenta de nuevo.');
    }
  };

  return (
    <div className="app">
      {/* Input oculto (el truco) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*"
      />

      <header className="header">
        <div className="logo">Mis XV Años</div>

        {/* Botón Personalizado */}
        <button
          className="upload-btn"
          onClick={handleUploadClick}
          disabled={uploading} // Desactivar si ya está subiendo
        >
          {uploading ? (
            <>
              Subiendo... <FiLoader className="spin-anim" />
            </>
          ) : (
            <>
              <FiPlus size={16} /> SUBIR FOTO
            </>
          )}
        </button>
      </header>

      <section className="hero">
        <h1>El Álbum de mi Fiesta</h1>
        <p>¡Gracias por acompañarme! Sube aquí tus fotos ✨.</p>
      </section>

      {/* GALERÍA */}
      <div className="gallery-container">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
            Cargando recuerdos...
          </div>
        ) : (
          <div className="masonry-grid">
            {media.map((item) => (
              <div
                key={item.public_id}
                className="photo-item"
                onClick={() => setSelectedImage(item)}
              >
                {item.format === 'mp4' || item.format === 'mov' ? (
                  <video
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto,vc_auto/${item.public_id}.${item.format}`}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,q_auto,f_auto/${item.public_id}.${item.format}`}
                    alt="Momento"
                    loading="lazy"
                  />
                )}

                <a
                  href={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment/${item.public_id}.${item.format}`}
                  className="download-badge"
                  onClick={(e) => e.stopPropagation()}
                  download
                >
                  <FiDownload size={18} />
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && media.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>
            <FiCamera
              size={48}
              style={{ marginBottom: 20 }}
            />
            <p>Aún no hay recuerdos.</p>
            <p style={{ fontSize: '0.9rem' }}>¡Sé el primero en compartir!</p>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button className="close-btn">
            <FiX />
          </button>
          {selectedImage.format === 'mp4' || selectedImage.format === 'mov' ? (
            <video
              controls
              autoPlay
              className="lightbox-content"
              src={`https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto/${selectedImage.public_id}.${selectedImage.format}`}
            />
          ) : (
            <img
              className="lightbox-content"
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${selectedImage.public_id}.${selectedImage.format}`}
              alt="Full screen"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;

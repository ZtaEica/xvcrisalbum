import { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  FiPlus,
  FiDownload,
  FiX,
  FiCamera,
  FiLoader,
  FiImage,
} from 'react-icons/fi';

const CLOUD_NAME = 'drbzyhoss';
const UPLOAD_PRESET = 'vsco_guest';
const TAG_NAME = 'album_quinces';

function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // DOS REFERENCIAS: Una para galería, una para cámara
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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

  // CLIC EN BOTÓN GALERÍA
  const handleGalleryClick = () => {
    galleryInputRef.current.click();
  };

  // CLIC EN BOTÓN CÁMARA
  const handleCameraClick = () => {
    cameraInputRef.current.click();
  };

  // PROCESAR ARCHIVO (Sirve para ambos inputs)
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('tags', TAG_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      console.log('Subida exitosa:', data);

      setTimeout(() => {
        fetchMedia();
        setUploading(false);
      }, 2000);
    } catch (error) {
      console.error('Error subiendo:', error);
      setUploading(false);
      alert('Error al subir. Intenta de nuevo.');
    }
  };

  return (
    <div className="app">
      {/* INPUT 1: GALERÍA (Permite fotos y videos) */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*"
      />

      {/* INPUT 2: CÁMARA (Fuerza la cámara trasera) */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />

      <header className="header">
        <div className="logo">Mis XV Años</div>

        <div className="header-actions">
          {/* BOTÓN CÁMARA RAPIDA */}
          <button
            className="camera-btn"
            onClick={handleCameraClick}
            disabled={uploading}
            title="Tomar Foto"
          >
            <FiCamera size={22} />
          </button>

          {/* BOTÓN GALERÍA */}
          <button
            className="upload-btn"
            onClick={handleGalleryClick}
            disabled={uploading}
          >
            {uploading ? (
              <FiLoader className="spin-anim" />
            ) : (
              <>
                <FiImage size={18} /> SUBIR
              </>
            )}
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>El Álbum de mi Fiesta</h1>
        <p>
          ¡Gracias por acompañarme! Sube aquí tus fotos favoritas de esta tarde
          mágica ✨.
        </p>
      </section>

      {/* GALERÍA (Mismo código de antes) */}
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
      </div>

      {/* LIGHTBOX (Mismo código de antes) */}
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

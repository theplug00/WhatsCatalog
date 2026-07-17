const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setError("Image must be under 5MB");
    return;
  }

  setUploading(true);
  setError("");
  try {
    // Show preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    // ✅ Upload to Supabase Storage - CORRECT SYNTAX
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;  // ✅ Backticks, not regular quotes

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    setImagePreview(publicUrl);
  } catch (err) {
    console.error('Upload error:', err);
    setError("Failed to upload image. Please try again.");
    setImagePreview(initialData?.image_url || "");
  } finally {
    setUploading(false);
  }
};
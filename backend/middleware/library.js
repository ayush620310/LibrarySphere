const Library = require("../models/Library");

const attachLibrary = async (req, res, next) => {
  try {
    const requestedLibraryId =
      req.query.libraryId || req.headers['x-library-id'] || req.params.libraryId;

    // 1. If an explicit libraryId is provided on a public/optional route or read query,
    // honor the requested libraryId to keep libraries isolated:
    if (requestedLibraryId && (req.isOptionalAuth || req.method === 'GET' || !req.admin)) {
      const library = await Library.findById(requestedLibraryId);
      if (!library) {
        return res.status(404).json({ success: false, message: 'Library not found.' });
      }
      req.library = library;
      return next();
    }

    // 2. If the request is authenticated for admin management operations,
    // isolate it to the admin's own library:
    if (req.admin) {
      if (!req.admin.library) {
        return res.status(403).json({ success: false, message: 'You do not own a library yet.' });
      }
      const library = await Library.findById(req.admin.library);
      if (!library) {
        return res.status(404).json({ success: false, message: 'Library not found.' });
      }
      req.library = library;
      return next();
    }

    // 3. Anonymous/public request with explicit libraryId
    if (requestedLibraryId) {
      const library = await Library.findById(requestedLibraryId);
      if (!library) {
        return res.status(404).json({ success: false, message: 'Library not found.' });
      }
      req.library = library;
      return next();
    }

    // 4. Default fallback when no libraryId specified
    const libraries = await Library.find();
    if (libraries.length === 0) {
      return res.status(404).json({ success: false, message: 'No library exists yet. Please create a library first.' });
    }
    if (libraries.length === 1) {
      req.library = libraries[0];
      return next();
    }
    return res.status(400).json({ success: false, message: 'libraryId is required when multiple libraries exist.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { attachLibrary };
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import BlobStorageMixin "blob-storage/Mixin";

actor class AnimeStream() = this {
  include BlobStorageMixin();

  public type AnimeEntry = {
    id : Nat;
    title : Text;
    description : Text;
    thumbnailBlobId : Text;
    videoBlobId : Text;
  };

  public type SiteSettings = {
    siteName : Text;
    logoUrl : Text;
    heroBlobId : Text;
    bgBlobId : Text;
    bgType : Text;
    bgColor : Text;
  };

  var nextId : Nat = 1;
  let animeMap = Map.empty<Nat, AnimeEntry>();
  var settings : SiteSettings = {
    siteName = "AnimeStream";
    logoUrl = "";
    heroBlobId = "";
    bgBlobId = "";
    bgType = "color";
    bgColor = "#0a0a0a";
  };

  public func addAnime(title : Text, description : Text, thumbnailBlobId : Text, videoBlobId : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let entry : AnimeEntry = { id; title; description; thumbnailBlobId; videoBlobId };
    animeMap.add(id, entry);
    id;
  };

  public func updateAnime(id : Nat, title : Text, description : Text, thumbnailBlobId : Text, videoBlobId : Text) : async Bool {
    if (animeMap.containsKey(id)) {
      let entry : AnimeEntry = { id; title; description; thumbnailBlobId; videoBlobId };
      animeMap.add(id, entry);
      true;
    } else {
      false;
    };
  };

  public func deleteAnime(id : Nat) : async Bool {
    if (animeMap.containsKey(id)) {
      animeMap.remove(id);
      true;
    } else {
      false;
    };
  };

  public query func getAllAnime() : async [AnimeEntry] {
    animeMap.values().toArray();
  };

  public query func getAnime(id : Nat) : async ?AnimeEntry {
    animeMap.get(id);
  };

  public func updateSettings(siteName : Text, logoUrl : Text, heroBlobId : Text, bgBlobId : Text, bgType : Text, bgColor : Text) : async () {
    settings := { siteName; logoUrl; heroBlobId; bgBlobId; bgType; bgColor };
  };

  public query func getSettings() : async SiteSettings {
    settings;
  };
};

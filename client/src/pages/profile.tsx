import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalNav } from "@/components/UniversalNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Phone, Mail, Camera, Truck, Calendar, Star, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: '',
    specializations: [] as string[],
    yearsExperience: '',
    cdlClass: '',
    endorsements: [] as string[]
  });

  // Fetch complete profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  // Fetch profile statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/profile/stats'],
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiRequest("POST", "/api/profile/avatar", formData);
    },
    onSuccess: () => {
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Avatar must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const getUserInitials = () => {
    const firstName = profileData.firstName || user?.firstName || "";
    const lastName = profileData.lastName || user?.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
  };

  const specializationOptions = [
    'Long Haul',
    'Local Delivery',
    'Flatbed',
    'Refrigerated',
    'Tanker',
    'Heavy Haul',
    'Car Hauler',
    'Dry Van',
    'Container',
    'Oversized Load'
  ];

  const endorsementOptions = [
    'HAZMAT',
    'Passenger',
    'School Bus',
    'Doubles/Triples',
    'Tank Vehicle',
    'Motorcycle'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <UniversalNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your profile information and professional details</p>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <div className="space-y-6">
                {/* Profile Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Profile Information</span>
                      <Button 
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                            <Camera className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {profileData.firstName} {profileData.lastName}
                        </h3>
                        <p className="text-gray-600">{profileData.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">Professional Driver</Badge>
                          <Badge variant="outline">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Personal Details Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address Information
                      </h4>
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profileData.city}
                            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={profileData.state}
                            onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={profileData.zipCode}
                            onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Tell us about your driving experience and goals..."
                        rows={4}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Professional Information Tab */}
            <TabsContent value="professional">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Professional Details
                    </CardTitle>
                    <CardDescription>
                      Manage your driving credentials and experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={profileData.yearsExperience}
                          onChange={(e) => setProfileData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cdlClass">CDL Class</Label>
                        <Select 
                          value={profileData.cdlClass} 
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, cdlClass: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CDL Class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Class A</SelectItem>
                            <SelectItem value="B">Class B</SelectItem>
                            <SelectItem value="C">Class C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Specializations</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {specializationOptions.map((spec) => (
                          <div key={spec} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={spec}
                              checked={profileData.specializations.includes(spec)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileData(prev => ({
                                    ...prev,
                                    specializations: [...prev.specializations, spec]
                                  }));
                                } else {
                                  setProfileData(prev => ({
                                    ...prev,
                                    specializations: prev.specializations.filter(s => s !== spec)
                                  }));
                                }
                              }}
                              disabled={!isEditing}
                              className="rounded"
                            />
                            <Label htmlFor={spec} className="text-sm">{spec}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>CDL Endorsements</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {endorsementOptions.map((endorsement) => (
                          <div key={endorsement} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={endorsement}
                              checked={profileData.endorsements.includes(endorsement)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileData(prev => ({
                                    ...prev,
                                    endorsements: [...prev.endorsements, endorsement]
                                  }));
                                } else {
                                  setProfileData(prev => ({
                                    ...prev,
                                    endorsements: prev.endorsements.filter(e => e !== endorsement)
                                  }));
                                }
                              }}
                              disabled={!isEditing}
                              className="rounded"
                            />
                            <Label htmlFor={endorsement} className="text-sm">{endorsement}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <div className="space-y-6">
                {/* Performance Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats?.totalJobs || 0}
                        </div>
                        <div className="text-sm text-gray-600">Jobs Completed</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stats?.safetyRating || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Safety Rating</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats?.onTimeDelivery || 0}%
                        </div>
                        <div className="text-sm text-gray-600">On-Time Delivery</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats?.totalMiles || 0}K
                        </div>
                        <div className="text-sm text-gray-600">Miles Driven</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements and Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements & Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Safety Champion</h4>
                          <p className="text-sm text-gray-600">No incidents for 12 months</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Verified Professional</h4>
                          <p className="text-sm text-gray-600">All documents verified</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Reliable Driver</h4>
                          <p className="text-sm text-gray-600">95%+ on-time delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg opacity-50">
                        <div className="bg-gray-100 p-3 rounded-full">
                          <Award className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">Elite Status</h4>
                          <p className="text-sm text-gray-600">Complete 100 jobs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
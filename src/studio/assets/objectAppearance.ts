import type { InteractiveObjectDef } from '../types';
import { STUDIO_ASSETS } from './registry';

// Appearance only: ownership and interaction behavior remain in layout/product data.
export function getObjectAsset(objDef: Pick<InteractiveObjectDef, 'id' | 'type' | 'roomType' | 'workstationStatus'> & { rotation?: number }) {
      let textureKey = 'obj_project_board';
      if (objDef.type === 'board') {
        if (objDef.id.includes('code_whiteboard')) textureKey = 'obj_code_whiteboard';
        else textureKey = objDef.id.includes('design') ? 'obj_design_board' : 'obj_project_board';
      } else if (objDef.type === 'moodboard') {
        textureKey = 'obj_moodboard_wall';
      } else if (objDef.type === 'art_review') {
        textureKey = 'obj_art_review_board';
      } else if (objDef.type === 'art_director') {
        textureKey = 'obj_art_director_desk';
      } else if (objDef.type === 'mechanic_board') {
        textureKey = 'obj_mechanic_board';
      } else if (objDef.type === 'flow_board') {
        textureKey = 'obj_flow_board';
      } else if (objDef.type === 'balancing_board') {
        textureKey = 'obj_balancing_board';
      } else if (objDef.type === 'lead_designer') {
        textureKey = 'obj_lead_designer_desk';
      } else if (objDef.type === 'audio_direction') {
        textureKey = 'obj_audio_direction_board';
      } else if (objDef.type === 'audio_listening') {
        textureKey = 'obj_audio_listening_station';
      } else if (objDef.type === 'lead_audio') {
        textureKey = 'obj_lead_audio_desk';
      } else if (objDef.type === 'music_workstation') {
        textureKey = 'obj_music_desk';
      } else if (objDef.type === 'sfx_workstation') {
        textureKey = 'obj_sfx_desk';
      } else if (objDef.type === 'monitor') {
        if (objDef.id.includes('server')) textureKey = 'obj_server_rack';
        else if (objDef.id.includes('projector')) textureKey = 'obj_projector_screen';
        else if (objDef.roomType === 'art') {
          if (objDef.workstationStatus === 'available') {
            textureKey = 'obj_art_desk_available';
          } else if (objDef.workstationStatus === 'assigned_offline') {
            textureKey = 'obj_art_desk_offline';
          } else {
            textureKey = 'obj_art_desk_active';
          }
        } else if (objDef.roomType === 'design') {
          if (objDef.workstationStatus === 'available') {
            textureKey = 'obj_design_desk_available';
          } else if (objDef.workstationStatus === 'assigned_offline') {
            textureKey = 'obj_design_desk_offline';
          } else {
            textureKey = 'obj_design_desk_active';
          }
        } else if (objDef.roomType === 'audio') {
          if (objDef.workstationStatus === 'available') {
            textureKey = 'obj_audio_desk_available';
          } else if (objDef.workstationStatus === 'assigned_offline') {
            textureKey = 'obj_audio_desk_offline';
          } else {
            textureKey = 'obj_music_desk';
          }
        } else {
          if (objDef.workstationStatus === 'available') {
            textureKey = 'obj_desk_available';
          } else if (objDef.workstationStatus === 'assigned_offline') {
            textureKey = 'obj_desk_assigned_offline';
          } else {
            textureKey = 'obj_desk_monitor';
          }
        }
      } else if (objDef.type === 'plaza_project_status') {
        textureKey = 'obj_plaza_project_status';
      } else if (objDef.type === 'studio_directory') {
        textureKey = objDef.id.includes('wayfinding') ? 'obj_plaza_wayfinding_sign' : 'obj_studio_directory';
      } else if (objDef.type === 'team_presence') {
        textureKey = 'obj_team_presence_board';
      } else if (objDef.type === 'announcement_board') {
        textureKey = 'obj_announcement_board';
      } else if (objDef.type === 'presentation_screen') {
        textureKey = 'obj_presentation_screen';
      } else if (objDef.type === 'meeting_board') {
        textureKey = 'obj_meeting_board';
      } else if (objDef.type === 'project_summary_board') {
        textureKey = 'obj_project_summary_board';
      } else if (objDef.type === 'meeting_leader') {
        textureKey = 'obj_meeting_podium';
      } else if (objDef.type === 'meeting_table') {
        textureKey = 'obj_large_meeting_table';
      } else if (objDef.type === 'canvas') {
        textureKey = 'obj_art_easel';
      } else if (objDef.type === 'directory') {
        textureKey = 'obj_studio_directory';
      } else if (objDef.type === 'coffee') {
        if (objDef.id.includes('plaza_coffee')) textureKey = 'obj_plaza_coffee_bar';
        else if (objDef.id.includes('water_cooler')) textureKey = 'obj_water_cooler';
        else textureKey = 'obj_coffee_station';
      } else if (objDef.type === 'arcade') {
        if (objDef.id.includes('audio_surround')) textureKey = 'obj_audio_surround_array';
        else textureKey = 'obj_arcade_cabinet';
      } else if (objDef.type === 'desk') {
        if (objDef.id.includes('plaza_lounge')) textureKey = 'obj_plaza_lounge_bench';
        else if (objDef.id.includes('meeting_lounge')) textureKey = 'obj_meeting_lounge_sofa';
        else if (objDef.id.includes('bench')) textureKey = 'obj_review_bench';
        else if (objDef.id.includes('design_discussion')) textureKey = 'obj_design_discussion_table';
        else if (objDef.id.includes('audio_discussion')) textureKey = 'obj_audio_discussion_table';
        else textureKey = 'obj_lounge_sofa';
      } else if (objDef.type === 'room_layout') {
        textureKey = 'obj_studio_directory';
      } else if (objDef.type === 'plant' || objDef.id.includes('plant')) {
        textureKey = 'obj_plant';
      } else if (objDef.id.includes('shelf')) {
        textureKey = 'obj_shared_shelf';
      } else if (objDef.id.includes('cabinet')) {
        textureKey = 'obj_shared_cabinet';
      } else if (objDef.id.includes('lamp')) {
        textureKey = 'obj_floor_lamp';
      }

  return STUDIO_ASSETS[`${textureKey}__facing_${objDef.rotation || 0}`] || STUDIO_ASSETS[textureKey];
}
